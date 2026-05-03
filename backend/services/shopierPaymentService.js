const crypto = require('crypto');

/**
 * SHOPIER PAYMENT SERVICE
 * Shopier Modül Entegrasyonu üzerinden ödeme formları oluşturur ve callbackleri doğrular.
 */
class ShopierPaymentService {
  constructor() {
    this.apiKey = process.env.SHOPIER_API_KEY;
    this.apiSecret = process.env.SHOPIER_API_SECRET;
    this.baseUrl = process.env.FRONTEND_URL || 'https://www.odelink.shop';
    this.callbackUrl = `${process.env.BACKEND_URL || 'https://api.odelink.shop'}/api/payments/shopier-callback`;
  }

  /**
   * Shopier ödeme formu için gerekli HTML çıktısını hazırlar
   */
  generatePaymentForm(data) {
    const { 
      user, 
      productName, 
      price, 
      orderId 
    } = data;

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Shopier API anahtarları eksik. Lütfen .env dosyasını kontrol edin.');
    }

    // Shopier formatına göre verileri hazırla
    const buyerData = {
      id: user.id,
      name: user.name?.split(' ')[0] || 'Müşteri',
      surname: user.name?.split(' ').slice(1).join(' ') || 'Soyadı',
      email: user.email,
      phone: user.phone || '05555555555'
    };

    const shopierParams = {
      API_KEY: this.apiKey,
      buyer_name: buyerData.name,
      buyer_surname: buyerData.surname,
      buyer_email: buyerData.email,
      buyer_phone: buyerData.phone,
      buyer_id: buyerData.id,
      buyer_address: 'Dijital Hizmet - Nova SaaS',
      buyer_city: 'Istanbul',
      buyer_country: 'Turkey',
      buyer_postcode: '34000',
      total_order_value: price,
      currency: 'TRY',
      platform: '0', // Özel yazılım
      is_test: process.env.NODE_ENV === 'production' ? '0' : '1',
      random_nr: Math.floor(Math.random() * 1000000),
      order_id: orderId,
      callback_url: this.callbackUrl,
      product_name: productName,
      type: '1' // Standart ödeme
    };

    // Hash oluşturma (Shopier OSB/Legacy Algorithm)
    // random_nr + order_id + total_order_value + currency
    const hashData = `${shopierParams.random_nr}${shopierParams.order_id}${shopierParams.total_order_value}${shopierParams.currency}`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(hashData)
      .digest('base64');

    // Otomatik post eden HTML formunu oluştur
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Yönlendiriliyorsunuz...</title>
        <style>body { background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }</style>
      </head>
      <body>
        <div>Ödeme sayfasına yönlendiriliyorsunuz, lütfen bekleyin...</div>
        <form id="shopier_form" action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post">
          ${Object.entries(shopierParams)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
            .join('\n')}
          <input type="hidden" name="signature" value="${signature}">
        </form>
        <script type="text/javascript">
          setTimeout(() => {
            document.getElementById('shopier_form').submit();
          }, 1000);
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Shopier'den gelen callback'i doğrular (OSB Format)
   */
  verifyCallback(postData) {
    const { res_order_id, res_random_nr, res_signature } = postData;
    
    if (!res_signature) return false;

    // OSB Verification: random_nr + order_id
    const hashData = `${res_random_nr}${res_order_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(hashData)
      .digest('base64');

    return res_signature === expectedSignature;
  }
}

module.exports = new ShopierPaymentService();
