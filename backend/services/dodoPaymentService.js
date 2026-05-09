const axios = require('axios');
const crypto = require('crypto');

class DodoPaymentService {
  constructor() {
    this.apiKey = process.env.DODO_API_KEY;
    this.webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    this.apiUrl = 'https://live.dodopayments.com/v1';
  }

  /**
   * Create a checkout session
   */
  async createCheckout({ productId, userEmail, userName, metadata }) {
    try {
      console.log('🚀 Creating Dodo Checkout for:', userEmail);
      
      const payload = {
        product_cart: [
          {
            product_id: productId,
            quantity: 1
          }
        ],
        customer: {
          email: userEmail,
          name: userName || userEmail.split('@')[0]
        },
        billing_address: {
          country: 'TR'
        },
        metadata: metadata || {},
        return_url: `https://www.odelink.shop/dashboard?payment=success`
      };

      console.log('📦 [DODO_DEBUG] Sending Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${this.apiUrl}/checkouts`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.url; // The checkout URL
    } catch (error) {
      console.error('❌ [DODO_FATAL_ERROR] Full Details:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  /**
   * Verify Webhook Signature
   */
  verifyWebhook(payload, signature) {
    try {
      // Dodo uses Svix for webhooks usually, or a standard HMAC
      // If it's standard HMAC-SHA256:
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const digest = hmac.update(payload).digest('hex');
      return digest === signature;
    } catch (error) {
      console.error('❌ Webhook Verification Error:', error);
      return false;
    }
  }
}

module.exports = new DodoPaymentService();
