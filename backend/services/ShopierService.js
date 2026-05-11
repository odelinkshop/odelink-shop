const crypto = require('crypto');

class ShopierService {
  /**
   * Shopier ödeme formu için gerekli olan güvenli imzayı oluşturur.
   */
  static generateSignature(apiSecret, data) {
    const { resale_en, dev_lang, module, buyer_id, buyer_name, buyer_surname, custom_params, total_order_value, currency, platform_order_id, callback_url, installment_limit, type } = data;
    
    // Shopier imza algoritması belirli bir sırayla verilerin birleştirilmesini bekler
    const dataToHash = [
      resale_en,
      dev_lang,
      module,
      buyer_id,
      buyer_name,
      buyer_surname,
      custom_params,
      total_order_value,
      currency,
      platform_order_id,
      callback_url,
      installment_limit,
      type
    ].join('');

    return crypto
      .createHmac('sha256', apiSecret)
      .update(dataToHash)
      .digest('base64');
  }

  /**
   * Shopier'den gelen callback (ödeme bildirimi) imzasını doğrular.
   */
  static verifyCallback(apiSecret, postData) {
    const { res_platform_order_id, res_random_nr, res_signature } = postData;
    
    if (!res_signature) return false;

    const dataToHash = res_platform_order_id + res_random_nr;
    const expectedSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(dataToHash)
      .digest('base64');

    return expectedSignature === res_signature;
  }

  /**
   * Ödeme formunu oluşturur ve Shopier'e yönlendirecek HTML formunu döner.
   */
  static createPaymentForm(apiKey, apiSecret, orderData) {
    const { 
      orderId, 
      totalAmount, 
      buyerName, 
      buyerSurname, 
      buyerEmail, 
      buyerPhone, 
      callbackUrl,
      currency = '0' // 0 = TRY, 1 = USD, 2 = EUR
    } = orderData;

    const shopierData = {
      resale_en: '0',
      dev_lang: 'tr',
      module: '1', // Custom module
      buyer_id: buyerEmail,
      buyer_name: buyerName,
      buyer_surname: buyerSurname,
      custom_params: '',
      total_order_value: totalAmount,
      currency: currency,
      platform_order_id: orderId,
      callback_url: callbackUrl,
      installment_limit: '0',
      type: '1' // 1 = Buy Now
    };

    const signature = this.generateSignature(apiSecret, shopierData);

    // Shopier'e gönderilecek olan Base64 encoded form verisi
    return {
      url: 'https://www.shopier.com/ShowProduct/api_pay4.php',
      fields: {
        API_KEY: apiKey,
        signature: signature,
        ...shopierData,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone
      }
    };
  }
}

module.exports = ShopierService;
