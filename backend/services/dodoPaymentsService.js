/**
 * DODO PAYMENTS SERVICE
 * Dodo Payments API entegrasyonu - Ödeme bağlantısı oluşturma ve webhook işleme
 */

const crypto = require('crypto');
const axios = require('axios');

// Environment variables
const DODO_PAYMENTS_API_KEY = process.env.DODO_PAYMENTS_API_KEY || '';
const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || '';
const TEST_MODE = process.env.TEST_MODE === 'true';
const DODO_API_BASE_URL = TEST_MODE 
  ? 'https://api.dodopayments.com/test'
  : 'https://api.dodopayments.com/v1';

/**
 * Custom Payment Error Class
 */
class PaymentError extends Error {
  constructor(message, category, statusCode = 500, details = {}) {
    super(message);
    this.name = 'PaymentError';
    this.category = category;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Dodo Payments Service Class
 */
class DodoPaymentsService {
  /**
   * Initialize service with API credentials
   * @param {string} apiKey - Dodo Payments API key
   * @param {string} webhookSecret - Webhook signature secret
   * @param {boolean} testMode - Enable test mode
   */
  constructor(apiKey = DODO_PAYMENTS_API_KEY, webhookSecret = DODO_WEBHOOK_SECRET, testMode = TEST_MODE) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.testMode = testMode;
    this.baseUrl = testMode 
      ? 'https://api.dodopayments.com/test'
      : 'https://api.dodopayments.com/v1';

    // Validate configuration
    this.validateConfig();
    
    if (testMode) {
      console.log('🧪 [TEST MODE] Dodo Payments Service initialized');
    } else {
      console.log('✅ Dodo Payments Service initialized');
    }
  }

  /**
   * Validate API configuration
   * @throws {PaymentError} If configuration is invalid
   */
  validateConfig() {
    if (!this.apiKey) {
      throw new PaymentError(
        'DODO_PAYMENTS_API_KEY environment variable is not set',
        'configuration_error',
        500
      );
    }

    if (!this.webhookSecret) {
      throw new PaymentError(
        'DODO_WEBHOOK_SECRET environment variable is not set',
        'configuration_error',
        500
      );
    }

    // Validate API key format (basic check)
    if (this.apiKey.length < 20) {
      throw new PaymentError(
        'Invalid DODO_PAYMENTS_API_KEY format',
        'configuration_error',
        500
      );
    }
  }

  /**
   * Create a checkout session for payment
   * @param {Object} params - Payment parameters
   * @param {string} params.productId - Product ID from Dodo Payments
   * @param {number} params.amount - Amount in TRY
   * @param {string} params.productType - 'subscription' or 'ad_package'
   * @param {Object} params.customer - Customer details
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<{checkoutUrl: string, sessionId: string}>}
   */
  async createCheckoutSession(params) {
    const { productId, amount, productType, customer, metadata } = params;

    // Validate required parameters
    if (!productId || !amount || !productType || !customer) {
      throw new PaymentError(
        'Missing required parameters for checkout session',
        'validation_error',
        400,
        { params }
      );
    }

    const logPrefix = this.testMode ? '[TEST MODE]' : '';
    console.log(`${logPrefix} 💳 Creating checkout session:`, {
      productId,
      amount,
      productType,
      customerEmail: customer.email
    });

    try {
      const requestBody = {
        product_id: productId,
        amount: amount,
        currency: 'TRY',
        customer: {
          email: customer.email,
          name: customer.name || '',
          phone: customer.phone || ''
        },
        metadata: {
          ...metadata,
          product_type: productType,
          test_mode: this.testMode
        },
        success_url: metadata.successUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: metadata.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
      };

      const response = await this.retryWithBackoff(async () => {
        return await axios.post(
          `${this.baseUrl}/checkout/sessions`,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 30000
          }
        );
      });

      const { checkout_url, session_id } = response.data;

      if (!checkout_url || !session_id) {
        throw new PaymentError(
          'Invalid response from Dodo Payments API',
          'api_error',
          500,
          { response: response.data }
        );
      }

      console.log(`${logPrefix} ✅ Checkout session created:`, session_id);

      return {
        checkoutUrl: checkout_url,
        sessionId: session_id
      };

    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      console.error(`${logPrefix} ❌ Checkout session creation failed:`, error.message);

      if (error.response) {
        throw new PaymentError(
          `Dodo Payments API error: ${error.response.data?.message || error.message}`,
          'api_error',
          error.response.status,
          {
            status: error.response.status,
            data: error.response.data
          }
        );
      }

      throw new PaymentError(
        `Failed to create checkout session: ${error.message}`,
        'api_error',
        500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Verify webhook signature using Standard Webhooks specification
   * @param {string} rawBody - Raw request body
   * @param {Object} headers - Webhook headers
   * @returns {boolean} - True if signature is valid
   */
  verifyWebhookSignature(rawBody, headers) {
    const webhookId = headers['webhook-id'];
    const webhookTimestamp = headers['webhook-timestamp'];
    const webhookSignature = headers['webhook-signature'];

    const logPrefix = this.testMode ? '[TEST MODE]' : '';

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.error(`${logPrefix} ❌ Missing webhook headers:`, {
        hasId: !!webhookId,
        hasTimestamp: !!webhookTimestamp,
        hasSignature: !!webhookSignature
      });
      return false;
    }

    try {
      // Build signed message: webhook-id.webhook-timestamp.payload
      const signedMessage = `${webhookId}.${webhookTimestamp}.${rawBody}`;

      // Compute HMAC SHA256
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signedMessage, 'utf8')
        .digest('base64');

      // Constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(webhookSignature),
        Buffer.from(expectedSignature)
      );

      if (isValid) {
        console.log(`${logPrefix} ✅ Webhook signature verified`);
      } else {
        console.error(`${logPrefix} ❌ Webhook signature verification failed`);
      }

      return isValid;

    } catch (error) {
      console.error(`${logPrefix} ❌ Webhook signature verification error:`, error.message);
      return false;
    }
  }

  /**
   * Query payment status from Dodo Payments
   * @param {string} paymentId - Dodo payment ID
   * @returns {Promise<Object>} - Payment status details
   */
  async getPaymentStatus(paymentId) {
    if (!paymentId) {
      throw new PaymentError(
        'Payment ID is required',
        'validation_error',
        400
      );
    }

    const logPrefix = this.testMode ? '[TEST MODE]' : '';
    console.log(`${logPrefix} 🔍 Querying payment status:`, paymentId);

    try {
      const response = await this.retryWithBackoff(async () => {
        return await axios.get(
          `${this.baseUrl}/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Accept': 'application/json'
            },
            timeout: 30000
          }
        );
      });

      const paymentData = response.data;

      console.log(`${logPrefix} ✅ Payment status retrieved:`, {
        paymentId,
        status: paymentData.status
      });

      return {
        id: paymentData.id || paymentData.payment_id,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency || 'TRY',
        paymentMethod: paymentData.payment_method,
        paymentDate: paymentData.payment_date || paymentData.paid_at,
        metadata: paymentData.metadata || {}
      };

    } catch (error) {
      console.error(`${logPrefix} ❌ Payment status query failed:`, error.message);

      if (error.response) {
        throw new PaymentError(
          `Dodo Payments API error: ${error.response.data?.message || error.message}`,
          'api_error',
          error.response.status,
          {
            status: error.response.status,
            data: error.response.data
          }
        );
      }

      throw new PaymentError(
        `Failed to query payment status: ${error.message}`,
        'api_error',
        500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Parse webhook payload
   * @param {string} rawBody - Raw request body
   * @returns {Object} - Parsed webhook event
   */
  parseWebhookPayload(rawBody) {
    try {
      const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

      const logPrefix = this.testMode ? '[TEST MODE]' : '';
      console.log(`${logPrefix} 📦 Parsing webhook payload:`, {
        type: payload.type,
        businessId: payload.business_id
      });

      // Validate payload structure
      if (!payload.type || !payload.data) {
        throw new PaymentError(
          'Invalid webhook payload structure',
          'validation_error',
          400,
          { payload }
        );
      }

      return {
        eventType: payload.type,
        businessId: payload.business_id,
        timestamp: payload.timestamp,
        data: payload.data
      };

    } catch (error) {
      if (error instanceof PaymentError) {
        throw error;
      }

      throw new PaymentError(
        `Failed to parse webhook payload: ${error.message}`,
        'validation_error',
        400,
        { originalError: error.message }
      );
    }
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries (default: 3)
   * @returns {Promise<any>} - Result of the function
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    const logPrefix = this.testMode ? '[TEST MODE]' : '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`${logPrefix} ❌ All ${maxRetries} retry attempts failed`);
          throw error;
        }

        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`${logPrefix} ⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Export singleton instance
const dodoPaymentsService = new DodoPaymentsService();

module.exports = {
  DodoPaymentsService,
  PaymentError,
  dodoPaymentsService
};
