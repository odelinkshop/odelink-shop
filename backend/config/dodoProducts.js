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

const AD_PACKAGES = {
  ad_basic: {
    name: 'Başlangıç',
    amount: 500,
    creditAmount: 500,
    dodoProductId: process.env.DODO_PRODUCT_AD_BASIC || 'prod_ad_basic',
    description: 'Başlangıç Reklam Paketi - 500 TRY kredi'
  },
  ad_professional: {
    name: 'Profesyonel',
    amount: 1200,
    creditAmount: 1200,
    dodoProductId: process.env.DODO_PRODUCT_AD_PROFESSIONAL || 'prod_ad_professional',
    description: 'Profesyonel Reklam Paketi - 1200 TRY kredi'
  },
  ad_premium: {
    name: 'Premium',
    amount: 2500,
    creditAmount: 2500,
    dodoProductId: process.env.DODO_PRODUCT_AD_PREMIUM || 'prod_ad_premium',
    description: 'Premium Reklam Paketi - 2500 TRY kredi'
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
 * Get ad package by ID
 * @param {string} packageId - Package ID (e.g., 'ad_basic')
 * @returns {Object|null} Package configuration or null if not found
 */
function getAdPackage(packageId) {
  return AD_PACKAGES[packageId] || null;
}

/**
 * Get all subscription products
 * @returns {Object} All subscription products
 */
function getAllSubscriptionProducts() {
  return { ...SUBSCRIPTION_PRODUCTS };
}

/**
 * Get all ad packages
 * @returns {Object} All ad packages
 */
function getAllAdPackages() {
  return { ...AD_PACKAGES };
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
  if (!process.env.DODO_PRODUCT_AD_BASIC) {
    missing.push('DODO_PRODUCT_AD_BASIC');
  }
  if (!process.env.DODO_PRODUCT_AD_PROFESSIONAL) {
    missing.push('DODO_PRODUCT_AD_PROFESSIONAL');
  }
  if (!process.env.DODO_PRODUCT_AD_PREMIUM) {
    missing.push('DODO_PRODUCT_AD_PREMIUM');
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
  AD_PACKAGES,
  getSubscriptionProduct,
  getAdPackage,
  getAllSubscriptionProducts,
  getAllAdPackages,
  validateProductConfiguration
};
