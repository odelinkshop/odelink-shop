/**
 * SHOPIFY TO SHOPIER API MAPPER SERVICE
 * Maps Shopify API calls to Shopier API and transforms data formats
 * Handles product data, collections, cart operations, and API response transformations
 */

/**
 * Maps Shopify product data to Shopier product format
 * @param {Object} shopifyProduct - Shopify product object
 * @returns {Object} Shopier product object
 */
function mapProductData(shopifyProduct) {
  if (!shopifyProduct || !shopifyProduct.id) {
    throw new Error('Invalid Shopify product: missing id');
  }

  // Extract sizes from variants
  const sizes = shopifyProduct.variants 
    ? shopifyProduct.variants.map(v => v.size || v.title).filter(Boolean)
    : [];

  // Extract all images
  const images = shopifyProduct.images 
    ? shopifyProduct.images.map(img => img.src || img)
    : [];

  // Parse price (convert from string to number)
  const price = parseFloat(shopifyProduct.price || shopifyProduct.variants?.[0]?.price || 0);

  // Convert USD to TRY (approximate rate, should be updated from live API)
  const USD_TO_TRY_RATE = 32.5;
  const priceInTRY = price * USD_TO_TRY_RATE;

  return {
    id: shopifyProduct.id,
    name: shopifyProduct.title,
    price: Math.round(priceInTRY * 100) / 100, // Round to 2 decimals
    currency: 'TRY',
    image: images[0] || '',
    images: images,
    sizes: sizes,
    url: `/product/${shopifyProduct.id}`,
    stock: shopifyProduct.variants?.[0]?.inventory_quantity || 0,
    description: shopifyProduct.body_html || shopifyProduct.description || '',
    category: shopifyProduct.product_type || ''
  };
}

/**
 * Maps Shopify collection data to Shopier collection format
 * @param {Object} shopifyCollection - Shopify collection object
 * @returns {Object} Shopier collection object
 */
function mapCollectionData(shopifyCollection) {
  if (!shopifyCollection || !shopifyCollection.id) {
    throw new Error('Invalid Shopify collection: missing id');
  }

  return {
    id: shopifyCollection.id,
    name: shopifyCollection.title,
    description: shopifyCollection.body_html || shopifyCollection.description || '',
    image: shopifyCollection.image?.src || '',
    url: `/collection/${shopifyCollection.handle || shopifyCollection.id}`,
    productCount: shopifyCollection.products_count || 0,
    products: shopifyCollection.products 
      ? shopifyCollection.products.map(mapProductData)
      : []
  };
}

/**
 * Maps Shopify cart operations to Shopier cart operations
 * @param {Object} operation - Cart operation object
 * @returns {Object} Shopier cart operation object
 */
function mapCartOperations(operation) {
  if (!operation || !operation.type) {
    throw new Error('Invalid cart operation: missing type');
  }

  const validTypes = ['add', 'remove', 'update', 'clear'];
  if (!validTypes.includes(operation.type)) {
    throw new Error(`Invalid cart operation type: ${operation.type}`);
  }

  // Map Shopify cart operation to Shopier format
  const shopierOperation = {
    action: operation.type,
    productId: operation.productId,
    quantity: operation.quantity || 1
  };

  // Add variant/size information if available
  if (operation.variantId) {
    shopierOperation.variantId = operation.variantId;
  }

  return shopierOperation;
}

/**
 * Transforms Shopier API response to target format
 * @param {any} shopierResponse - Raw Shopier API response
 * @param {string} targetFormat - Target format ('product', 'collection', 'cart')
 * @returns {any} Transformed response
 */
function transformAPIResponse(shopierResponse, targetFormat) {
  if (!shopierResponse) {
    return null;
  }

  switch (targetFormat) {
    case 'product':
      return transformProductResponse(shopierResponse);
    
    case 'collection':
      return transformCollectionResponse(shopierResponse);
    
    case 'cart':
      return transformCartResponse(shopierResponse);
    
    default:
      // Return as-is for unknown formats
      return shopierResponse;
  }
}

/**
 * Transforms Shopier product response to standard format
 * @param {Object} response - Shopier product response
 * @returns {Object} Transformed product
 */
function transformProductResponse(response) {
  // Handle array of products
  if (Array.isArray(response)) {
    return response.map(product => ({
      id: product.id || product.product_id,
      name: product.name || product.title,
      price: parseFloat(product.price || 0),
      currency: product.currency || 'TRY',
      image: product.image || product.image_url || product.images?.[0] || '',
      images: product.images || [],
      sizes: product.sizes || product.variants?.map(v => v.size) || [],
      url: product.url || `/product/${product.id}`,
      stock: product.stock || product.stock_quantity || 0,
      description: product.description || '',
      category: product.category || ''
    }));
  }

  // Handle single product
  return {
    id: response.id || response.product_id,
    name: response.name || response.title,
    price: parseFloat(response.price || 0),
    currency: response.currency || 'TRY',
    image: response.image || response.image_url || response.images?.[0] || '',
    images: response.images || [],
    sizes: response.sizes || response.variants?.map(v => v.size) || [],
    url: response.url || `/product/${response.id}`,
    stock: response.stock || response.stock_quantity || 0,
    description: response.description || '',
    category: response.category || ''
  };
}

/**
 * Transforms Shopier collection response to standard format
 * @param {Object} response - Shopier collection response
 * @returns {Object} Transformed collection
 */
function transformCollectionResponse(response) {
  if (Array.isArray(response)) {
    return response.map(collection => ({
      id: collection.id,
      name: collection.name || collection.title,
      description: collection.description || '',
      image: collection.image || '',
      url: collection.url || `/collection/${collection.id}`,
      productCount: collection.productCount || collection.products?.length || 0,
      products: collection.products || []
    }));
  }

  return {
    id: response.id,
    name: response.name || response.title,
    description: response.description || '',
    image: response.image || '',
    url: response.url || `/collection/${response.id}`,
    productCount: response.productCount || response.products?.length || 0,
    products: response.products || []
  };
}

/**
 * Transforms Shopier cart response to standard format
 * @param {Object} response - Shopier cart response
 * @returns {Object} Transformed cart
 */
function transformCartResponse(response) {
  return {
    items: response.items || response.cart_items || [],
    total: parseFloat(response.total || response.total_price || 0),
    currency: response.currency || 'TRY',
    itemCount: response.item_count || response.items?.length || 0
  };
}

/**
 * Gets current USD to TRY exchange rate (placeholder - should fetch from API)
 * @returns {Promise<number>} Exchange rate
 */
async function getExchangeRate() {
  // TODO: Implement real exchange rate API call
  // For now, return a fixed rate
  return 32.5;
}

module.exports = {
  mapProductData,
  mapCollectionData,
  mapCartOperations,
  transformAPIResponse,
  getExchangeRate
};
