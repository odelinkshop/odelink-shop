/**
 * EMAIL NOTIFICATION SERVICE
 * Handles email notifications for payment confirmations, failures, and renewals
 */

const nodemailer = require('nodemailer');

const TEST_MODE = process.env.TEST_MODE === 'true';

/**
 * Build email transporter
 * @returns {Promise<Object>} Nodemailer transporter
 */
async function buildTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    const err = new Error('EMAIL yapılandırması eksik');
    err.code = 'EMAIL_MISCONFIG';
    throw err;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.verify();
  return transporter;
}

/**
 * Email Notification Service Class
 */
class EmailNotificationService {
  /**
   * Send subscription confirmation email
   * @param {Object} params - Email parameters
   * @param {string} params.userEmail - User email address
   * @param {string} params.userName - User name
   * @param {string} params.tier - Subscription tier (standart/profesyonel)
   * @param {string} params.billingCycle - Billing cycle (monthly/yearly)
   * @param {number} params.amount - Payment amount
   * @param {string} params.transactionId - Transaction ID
   */
  static async sendSubscriptionConfirmation(params) {
    const { userEmail, userName, tier, billingCycle, amount, transactionId } = params;

    const logPrefix = TEST_MODE ? '[TEST MODE]' : '';
    
    if (TEST_MODE) {
      console.log(`${logPrefix} 📧 [MOCK] Subscription confirmation email:`, {
        to: userEmail,
        tier,
        billingCycle,
        amount,
        transactionId
      });
      return { success: true, mock: true };
    }

    try {
      const transporter = await buildTransporter();

      const planName = tier === 'profesyonel' ? 'Profesyonel' : 'Standart';
      const cycleName = billingCycle === 'yearly' ? 'Yıllık' : 'Aylık';
      const maxSites = tier === 'profesyonel' ? 10 : 3;

      const subject = `✅ Aboneliğiniz Aktif - ${planName} Plan`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Ödemeniz Başarıyla Tamamlandı!</h2>
          
          <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
          
          <p>Odelink <strong>${planName}</strong> aboneliğiniz başarıyla aktifleştirildi.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Abonelik Detayları</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0;"><strong>Plan:</strong> ${planName}</li>
              <li style="padding: 8px 0;"><strong>Dönem:</strong> ${cycleName}</li>
              <li style="padding: 8px 0;"><strong>Tutar:</strong> ₺${amount}</li>
              <li style="padding: 8px 0;"><strong>Maksimum Site:</strong> ${maxSites} vitrin sitesi</li>
              <li style="padding: 8px 0;"><strong>İşlem No:</strong> ${transactionId}</li>
            </ul>
          </div>
          
          <p>Artık tüm özelliklerden yararlanabilirsiniz:</p>
          <ul>
            ${tier === 'profesyonel' ? `
              <li>10 vitrin sitesi oluşturma</li>
              <li>Tüm renk paleti</li>
              <li>Özel alan adı</li>
              <li>Gelişmiş analitik</li>
              <li>VIP destek</li>
            ` : `
              <li>3 vitrin sitesi oluşturma</li>
              <li>Tema/renk özelleştirme</li>
              <li>Logo yükleme</li>
              <li>Temel analitik</li>
              <li>Öncelikli destek</li>
            `}
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Dashboard'a Git
            </a>
          </p>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        html
      });

      console.log(`${logPrefix} ✅ Subscription confirmation email sent:`, userEmail);
      return { success: true };

    } catch (error) {
      console.error(`${logPrefix} ❌ Failed to send subscription confirmation email:`, error.message);
      throw error;
    }
  }

  /**
   * Send advertisement credit confirmation email
   * @param {Object} params - Email parameters
   * @param {string} params.userEmail - User email address
   * @param {string} params.userName - User name
   * @param {string} params.packageName - Package name (Başlangıç/Profesyonel/Premium)
   * @param {number} params.creditAmount - Credit amount added
   * @param {number} params.newBalance - New credit balance
   * @param {string} params.transactionId - Transaction ID
   */
  static async sendCreditConfirmation(params) {
    const { userEmail, userName, packageName, creditAmount, newBalance, transactionId } = params;

    const logPrefix = TEST_MODE ? '[TEST MODE]' : '';
    
    if (TEST_MODE) {
      console.log(`${logPrefix} 📧 [MOCK] Credit confirmation email:`, {
        to: userEmail,
        packageName,
        creditAmount,
        newBalance,
        transactionId
      });
      return { success: true, mock: true };
    }

    try {
      const transporter = await buildTransporter();

      const subject = `✅ Reklam Krediniz Yüklendi - ${packageName} Paket`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Ödemeniz Başarıyla Tamamlandı!</h2>
          
          <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
          
          <p>Reklam krediniz hesabınıza başarıyla yüklendi.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Kredi Detayları</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0;"><strong>Paket:</strong> ${packageName}</li>
              <li style="padding: 8px 0;"><strong>Yüklenen Kredi:</strong> ₺${creditAmount}</li>
              <li style="padding: 8px 0;"><strong>Yeni Bakiye:</strong> ₺${newBalance}</li>
              <li style="padding: 8px 0;"><strong>İşlem No:</strong> ${transactionId}</li>
            </ul>
          </div>
          
          <p>Artık reklam kredinizi kullanarak vitrin sitelerinizi tanıtabilirsiniz!</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard/advertisements" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reklam Ver
            </a>
          </p>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        html
      });

      console.log(`${logPrefix} ✅ Credit confirmation email sent:`, userEmail);
      return { success: true };

    } catch (error) {
      console.error(`${logPrefix} ❌ Failed to send credit confirmation email:`, error.message);
      throw error;
    }
  }

  /**
   * Send payment failure notification email
   * @param {Object} params - Email parameters
   * @param {string} params.userEmail - User email address
   * @param {string} params.userName - User name
   * @param {string} params.productType - Product type (subscription/ad_package)
   * @param {string} params.failureReason - Failure reason
   * @param {string} params.transactionId - Transaction ID
   */
  static async sendPaymentFailure(params) {
    const { userEmail, userName, productType, failureReason, transactionId } = params;

    const logPrefix = TEST_MODE ? '[TEST MODE]' : '';
    
    if (TEST_MODE) {
      console.log(`${logPrefix} 📧 [MOCK] Payment failure email:`, {
        to: userEmail,
        productType,
        failureReason,
        transactionId
      });
      return { success: true, mock: true };
    }

    try {
      const transporter = await buildTransporter();

      const productName = productType === 'subscription' ? 'Abonelik' : 'Reklam Paketi';
      const subject = `❌ Ödeme Başarısız - ${productName}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Ödeme İşlemi Başarısız</h2>
          
          <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
          
          <p>Maalesef ${productName.toLowerCase()} ödemesi tamamlanamadı.</p>
          
          <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <h3 style="margin-top: 0; color: #991B1B;">Hata Detayı</h3>
            <p style="margin: 0;"><strong>Sebep:</strong> ${failureReason}</p>
            <p style="margin: 10px 0 0 0;"><strong>İşlem No:</strong> ${transactionId}</p>
          </div>
          
          <p>Lütfen ödeme bilgilerinizi kontrol edip tekrar deneyiniz.</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/pricing" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Tekrar Dene
            </a>
          </p>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Sorun devam ederse destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        html
      });

      console.log(`${logPrefix} ✅ Payment failure email sent:`, userEmail);
      return { success: true };

    } catch (error) {
      console.error(`${logPrefix} ❌ Failed to send payment failure email:`, error.message);
      throw error;
    }
  }

  /**
   * Send subscription renewal confirmation email
   * @param {Object} params - Email parameters
   * @param {string} params.userEmail - User email address
   * @param {string} params.userName - User name
   * @param {string} params.tier - Subscription tier
   * @param {string} params.billingCycle - Billing cycle
   * @param {number} params.amount - Payment amount
   * @param {Date} params.nextBillingDate - Next billing date
   * @param {string} params.transactionId - Transaction ID
   */
  static async sendRenewalConfirmation(params) {
    const { userEmail, userName, tier, billingCycle, amount, nextBillingDate, transactionId } = params;

    const logPrefix = TEST_MODE ? '[TEST MODE]' : '';
    
    if (TEST_MODE) {
      console.log(`${logPrefix} 📧 [MOCK] Renewal confirmation email:`, {
        to: userEmail,
        tier,
        billingCycle,
        amount,
        nextBillingDate,
        transactionId
      });
      return { success: true, mock: true };
    }

    try {
      const transporter = await buildTransporter();

      const planName = tier === 'profesyonel' ? 'Profesyonel' : 'Standart';
      const cycleName = billingCycle === 'yearly' ? 'Yıllık' : 'Aylık';
      const nextDate = new Date(nextBillingDate).toLocaleDateString('tr-TR');

      const subject = `✅ Aboneliğiniz Yenilendi - ${planName} Plan`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Aboneliğiniz Yenilendi!</h2>
          
          <p>Merhaba ${userName || 'Değerli Kullanıcı'},</p>
          
          <p>Odelink <strong>${planName}</strong> aboneliğiniz başarıyla yenilendi.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Yenileme Detayları</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0;"><strong>Plan:</strong> ${planName}</li>
              <li style="padding: 8px 0;"><strong>Dönem:</strong> ${cycleName}</li>
              <li style="padding: 8px 0;"><strong>Tutar:</strong> ₺${amount}</li>
              <li style="padding: 8px 0;"><strong>Sonraki Ödeme:</strong> ${nextDate}</li>
              <li style="padding: 8px 0;"><strong>İşlem No:</strong> ${transactionId}</li>
            </ul>
          </div>
          
          <p>Hizmetiniz kesintisiz devam ediyor.</p>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Dashboard'a Git
            </a>
          </p>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        html
      });

      console.log(`${logPrefix} ✅ Renewal confirmation email sent:`, userEmail);
      return { success: true };

    } catch (error) {
      console.error(`${logPrefix} ❌ Failed to send renewal confirmation email:`, error.message);
      throw error;
    }
  }
}

module.exports = EmailNotificationService;
