/**
 * Dodo Payments Product Mapping Configuration
 * Maps internal product IDs to Dodo Payments product IDs
 */

const SUBSCRIPTION_PRODUCTS = {
  standard_monthly: {
    tier: 'standart',
    billingCycle: 'monthly',
    amount: 299,
    dodoProductId: process.env.DODO_PRODUCT_STANDARD_MONTHLY || 'prod_standard_monthly',
    description: 'Standart Aylık Plan - 3 vitrin sitesi'
  },
  professional_yearly: {
    tier: 'profesyonel',
    billingCycle: 'yearly',
    amount: 399,
    dodoProductId: process.env.DODO_PRODUCT_PROFESSIONAL_YEARLY || 'prod_professional_yearly',
    description: 'Profesyonel Yıllık Plan - 10 vitrin sitesi'
  }
};

/**
 * Get subscription product by ID
 * @param {string} productId - Product ID (e.g., 'standard_monthly')
 * @returns {Object|null} Product configuration or null if not found
 */
function getSubscriptionProduct(productId) {
  return SUBSCRIPTION_PRODUCTS[productId] || null;
}

/**
 * Get all subscription products
 * @returns {Object} All subscription products
 */
function getAllSubscriptionProducts() {
  return { ...SUBSCRIPTION_PRODUCTS };
}

/**
 * Validate product configuration
 * Checks if all required environment variables are set
 * @returns {Object} Validation result with status and missing variables
 */
function validateProductConfiguration() {
  const missing = [];
  
  if (!process.env.DODO_PRODUCT_STANDARD_MONTHLY) {
    missing.push('DODO_PRODUCT_STANDARD_MONTHLY');
  }
  if (!process.env.DODO_PRODUCT_PROFESSIONAL_YEARLY) {
    missing.push('DODO_PRODUCT_PROFESSIONAL_YEARLY');
  }

  return {
    valid: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `Missing product IDs: ${missing.join(', ')}. Using default values.`
      : 'All product IDs configured'
  };
}

module.exports = {
  SUBSCRIPTION_PRODUCTS,
  getSubscriptionProduct,
  getAllSubscriptionProducts,
  validateProductConfiguration
};
