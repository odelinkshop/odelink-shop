const express = require('express');

const router = express.Router();

// In-memory cart store: key => cart state
// NOTE: VPS restartlarında sıfırlanır (şimdilik tema entegrasyonu için yeterli).
const cartStore = new Map();

function getRefererSubdomain(req) {
  try {
    const ref = (req.headers.referer || '').toString();
    if (!ref) return '';
    const url = new URL(ref);
    return (url.searchParams.get('subdomain') || '').toString().trim().toLowerCase();
  } catch (e) {
    return '';
  }
}

function resolveSubdomain(req) {
  const fromQuery = (req.query?.subdomain || '').toString().trim().toLowerCase();
  if (fromQuery) return fromQuery;

  const fromBody = (req.body?.subdomain || '').toString().trim().toLowerCase();
  if (fromBody) return fromBody;

  const fromReferer = getRefererSubdomain(req);
  if (fromReferer) return fromReferer;

  return '';
}

function normalizeMoneyToken(token) {
  if (token === null || token === undefined) return NaN;
  let s = String(token).replace(/\s+/g, '').trim();
  if (!s) return NaN;

  // If token like 2.550,00 => thousands '.' + decimals ','
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.includes(',')) {
    // 2550,00 => decimals ','
    s = s.replace(/,/g, '.');
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

function parseMoneyFirstTwo(raw) {
  const str = String(raw ?? '');
  const tokens = str.match(/-?\d[\d.,]*/g) || [];
  const nums = tokens.slice(0, 2).map(normalizeMoneyToken).filter((n) => Number.isFinite(n));
  return nums; // [sale, regular?]
}

function formatTurkishMoney(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const cur = (currency || 'TL').toString().trim().toUpperCase();
  const fixed = n.toFixed(2); // dot decimal
  const [intPart, decPart] = fixed.split('.');
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${groupedInt},${decPart} ${cur}`;
}

function getOrCreateCart(subdomain) {
  const key = (subdomain || '').toString();
  if (!cartStore.has(key)) {
    cartStore.set(key, {
      subdomain: key,
      // key => item
      items: new Map(),
      updatedAt: Date.now(),
    });
  }
  return cartStore.get(key);
}

function productToCartItem(product, quantity, index) {
  const currency = 'TL';
  const unitMoney = parseMoneyFirstTwo(product?.price || product?.currentPrice || 0)[0] ?? 0;
  const tMoney = unitMoney * quantity;

  const idNumeric =
    typeof index === 'number' && Number.isFinite(index) ? index : (() => {
      const m = String(product?.id || '').match(/(\d+)\s*$/);
      return m ? Number(m[1]) : 0;
    })();

  return {
    // Ödelink template needs these names
    pId: idNumeric,
    vId: 0,
    cId: 0,
    integralProduct: 0,

    url: product?.url || product?.shopierUrl || '',
    imagePath: product?.image || product?.imageUrl || product?.img || '',
    name: product?.name || product?.title || 'Ürün',
    variant: '',

    price: formatTurkishMoney(unitMoney, currency),
    piece: quantity,
    salesUnit: 'Adet',

    tPrice: formatTurkishMoney(tMoney, currency),

    // Extra fields sometimes referenced
    tAmount: tMoney,
  };
}

function buildCartResponse(cart) {
  const products = Array.from(cart.items.values());
  const ensureProductShape = (raw, productId) => {
    const product = raw && typeof raw === 'object' ? raw : {};

    return {
      pId: productId,
      vId: 0,
      cId: 0,
      integralProduct: 0,

      url: product?.url || product?.shopierUrl || '',
      imagePath: product?.image || product?.imageUrl || product?.img || '',
      name: product?.name || product?.title || 'Ürün',
      variant: '',

      price: '',
      piece: 0,
      salesUnit: 'Adet',

      tPrice: '',

      // Extra fields sometimes referenced
      tAmount: 0,
    };
  };

  const tAmount = products.reduce((sum, p) => {
    const unit = Number(String(p.tAmount ?? 0));
    return sum + unit;
  }, 0);

  const pCount = products.reduce((sum, p) => sum + (Number(p.piece) || 0), 0);

  return {
    cart: {
      products: products.map((p) => ensureProductShape(p, p.pId)),
      products,
      tAmount: formatTurkishMoney(tAmount, 'TL'),
      pCount,
      campaigns: [],
      // some templates read these directly
      basketUrl: '/Sepet',
      basketUrl2: '/checkout',
    },
  };
}

// GET /api/cart?subdomain=...
router.get('/', (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    const cart = getOrCreateCart(subdomain);
    const items = Array.from(cart.items.values());
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'cart_read_failed' });
  }
});

// GET /api/cart/GetCart (odelinkApi.cart.getLite içinden bekleniyor)
router.get('/GetCart', (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    const cart = getOrCreateCart(subdomain);
    res.json(buildCartResponse(cart));
  } catch (e) {
    res.status(500).json({ error: 'cart_getcart_failed' });
  }
});

// GET /api/cart/Get (bazı sayfalar direkt bunu kullanıyor)
router.get('/Get', (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    const cart = getOrCreateCart(subdomain);
    res.json(buildCartResponse(cart));
  } catch (e) {
    res.status(500).json({ error: 'cart_get_failed' });
  }
});

// POST /api/cart/add (shopier-integration modalı burayı çağırıyor)
router.post('/add', express.json(), (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    if (!subdomain) return res.status(400).json({ error: 'subdomain_required' });

    const productId = (req.body?.productId || req.body?.id || '').toString();
    const quantity = Math.max(1, Number(req.body?.quantity || req.body?.piece || 1) || 1);
    const product = req.body?.product || {};

    if (!productId) return res.status(400).json({ error: 'productId_required' });

    const cart = getOrCreateCart(subdomain);

    const existing = cart.items.get(productId);
    const nextQty = (existing?.piece || 0) + quantity;

    cart.items.set(productId, productToCartItem(product, nextQty, cart.items.size));
    cart.updatedAt = Date.now();

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'cart_add_failed' });
  }
});

// POST /api/cart/MoveProduct (odelink theme add-to-cart akışı burayı çağırabilir)
router.post('/MoveProduct', express.json(), (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    if (!subdomain) return res.status(400).json({ error: 'subdomain_required' });

    // Model şu alanları taşıyor olabiliyor:
    // productUnique, productId, variantId, piece, assortmentProductId, productUrl
    const productId = (req.body?.productUnique || req.body?.productId || '').toString();
    const quantity = Math.max(1, Number(req.body?.piece || req.body?.quantity || 1) || 1);

    // Shopier-mapping için yeterli değilse, en azından bir ürün olsun diye minimal productUrl taşırız
    const product = {
      id: productId,
      name: req.body?.name || 'Ürün',
      image: req.body?.image || '',
      url: req.body?.productUrl || '',
      price: req.body?.price || '0',
      oldPrice: req.body?.oldPrice || null,
      shopierUrl: req.body?.productUrl || '',
    };

    if (!productId) return res.status(400).json({ error: 'productId_required' });

    const cart = getOrCreateCart(subdomain);
    const existing = cart.items.get(productId);
    const nextQty = (existing?.piece || 0) + quantity;

    cart.items.set(productId, productToCartItem(product, nextQty, cart.items.size));
    cart.updatedAt = Date.now();

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'cart_move_failed' });
  }
});

// POST /api/cart/RemoveFromCart (odelink sepetten çıkarma çağırabilir)
router.post('/RemoveFromCart', express.json(), (req, res) => {
  try {
    const subdomain = resolveSubdomain(req);
    if (!subdomain) return res.status(400).json({ error: 'subdomain_required' });

    const vId = req.body?.vId ?? req.body?.variantId ?? req.body?.VariantId;
    const cId = req.body?.cId ?? req.body?.cartId ?? req.body?.GroupId;

    // Bizim store anahtarımız productId (string). vId/cId ile birebir eşleşme garanti değil.
    // O yüzden basit strateji: vId numeric ise productId olarak da dene, yoksa cart içinden parça sayımı ile en yakını çıkar.
    const possibleKey = vId !== undefined && vId !== null ? String(vId) : '';
    const cart = getOrCreateCart(subdomain);

    if (possibleKey && cart.items.has(possibleKey)) {
      cart.items.delete(possibleKey);
    } else if (cart.items.size > 0) {
      // fallback: sadece en son eklenen ürünü sil (tema için yeterli)
      const lastKey = Array.from(cart.items.keys()).pop();
      if (lastKey) cart.items.delete(lastKey);
    }

    cart.updatedAt = Date.now();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'cart_remove_failed' });
  }
});

// The theme might call these even if we don't implement fully.
router.post('/SetDefaultCart', express.json(), (req, res) => res.json({ ok: true }));
router.post('/CreateCart', express.json(), (req, res) => res.json({ ok: true }));
router.post('/GetCarts', express.json(), (req, res) => res.json({ ok: true, carts: [] }));
router.post('/DeleteCarts', express.json(), (req, res) => res.json({ ok: true }));
router.post('/MergeCarts', express.json(), (req, res) => res.json({ ok: true }));
router.post('/editCartByStore', express.json(), (req, res) => res.json({ ok: true }));
router.post('/DeleteHopiCampaignFromCart', express.json(), (req, res) => res.json({ ok: true }));
router.post('/HopiApplyCampaign', express.json(), (req, res) => res.json({ ok: true }));
router.get('/GetHopiAccountInfo', (req, res) => res.json({ ok: true }));
router.post('/SaveHopiCampaignToCart', express.json(), (req, res) => res.json({ ok: true }));
router.post('/DeleteHopiCampaignFromCart', express.json(), (req, res) => res.json({ ok: true }));

module.exports = router;

