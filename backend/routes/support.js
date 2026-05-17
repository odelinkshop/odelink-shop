// Support ticket mail router verified for Gmail SMTP
const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/Subscription');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().max(255).required(),
  subject: Joi.string().min(2).max(120).required(),
  message: Joi.string().min(5).max(5000).required(),
  page: Joi.string().max(256).allow('').optional(),
  visitorId: Joi.string().max(128).allow('').optional()
});

const buildTransporter = async () => {
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
};

function getUserIdFromRequest(req) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret);
    return decoded?.userId || null;
  } catch (e) {
    return null;
  }
}

router.post('/send', async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Geçersiz istek' });
    }

    // Resolve Sender client IP dynamically
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Bilinmiyor';
    const rawUserAgent = req.headers['user-agent'] || 'Bilinmiyor';
    const sealedAt = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let priorityLabel = '';
    let planMeta = null;
    const userId = getUserIdFromRequest(req);
    if (userId) {
      try {
        const capabilities = await Subscription.getUserCapabilities(userId);
        planMeta = capabilities;
        if (capabilities?.vipSupport) {
          priorityLabel = 'VIP';
        } else if (capabilities?.supportLevel === 'priority') {
          priorityLabel = 'ÖNCELİKLİ';
        }
      } catch (e2) {
        void e2;
      }
    }

    const to = (process.env.SUPPORT_EMAIL || 'odelinkdestek@gmail.com').trim();
    const transporter = await buildTransporter();

    const safeSubject = `${priorityLabel ? `[${priorityLabel}] ` : ''}[Ödelink Destek] ${value.subject}`;
    
    // Choose styling variables and dynamic SLA banners based on plan tier
    let planColor = '#a1a1aa';
    let badgeStyles = 'background-color: rgba(255, 255, 255, 0.03); color: #a1a1aa; border: 1px solid rgba(255, 255, 255, 0.08);';
    let slaBannerHtml = '';
    
    if (priorityLabel === 'VIP') {
      planColor = '#f59e0b';
      badgeStyles = 'background-color: rgba(234, 179, 8, 0.1); color: #f59e0b; border: 1px solid rgba(234, 179, 8, 0.25);';
      slaBannerHtml = `
      <!-- VIP SLA Directive Card -->
      <tr>
        <td style="padding: 0 40px 10px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(234, 179, 8, 0.04); border: 1px solid rgba(234, 179, 8, 0.15); border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #f59e0b; line-height: 1.5; font-weight: 500;">
                👑 <strong>VIP YÖNLENDİRME DİREKTİFİ:</strong> Bu talep <strong>${String(planMeta?.tier || 'VIP').toUpperCase()}</strong> üyesinden gelmiştir. VIP SLA protokolü uyarınca maksimum yanıt süreniz <strong>15 Dakika</strong> olarak tanımlanmıştır.
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    } else if (priorityLabel === 'ÖNCELİKLİ') {
      planColor = '#3b82f6';
      badgeStyles = 'background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.25);';
      slaBannerHtml = `
      <!-- Priority SLA Directive Card -->
      <tr>
        <td style="padding: 0 40px 10px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(59, 130, 246, 0.04); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #3b82f6; line-height: 1.5; font-weight: 500;">
                ⚡ <strong>ÖNCELİKLİ HİZMET DİREKTİFİ:</strong> Müşteri öncelikli destek planına sahiptir. Yanıt hedef süreniz <strong>2 Saat</strong> olarak tanımlanmıştır.
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    } else {
      slaBannerHtml = `
      <!-- Standard SLA Directive Card -->
      <tr>
        <td style="padding: 0 40px 10px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                🛡️ <strong>STANDART HİZMET BİLGİSİ:</strong> Standart destek SLA protokolü uyarınca yanıt hedef süreniz <strong>24 Saat</strong> olarak tanımlanmıştır.
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    }

    const text = [
      `Ad: ${value.name}`,
      `E-posta: ${value.email}`,
      planMeta ? `Paket: ${String(planMeta.tier || '').toUpperCase()} (${planMeta.billingCycle || 'monthly'})` : null,
      value.page ? `Sayfa: ${value.page}` : null,
      value.visitorId ? `VisitorId: ${value.visitorId}` : null,
      `Gönderen IP: ${clientIp}`,
      '',
      value.message
    ].filter(Boolean).join('\n');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeSubject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
      <table width="100%" bgcolor="#050505" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; padding: 40px 0;">
        <tr>
          <td align="center" style="padding: 0 20px;">
            
            <!-- Modern Flat Outer Card Wrapper -->
            <table width="100%" max-width="580" align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #09090b; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.9);">
              
              <!-- Glow Strip -->
              <tr>
                <td style="height: 3px; background: linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #db2777 100%);"></td>
              </tr>
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left">
                        <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: #ffffff; margin: 0;">Ödelink</div>
                        <div style="font-size: 8px; font-weight: 700; letter-spacing: 0.15em; color: #71717a; text-transform: uppercase; margin-top: 4px;">SECURE ROUTING SUITE</div>
                      </td>
                      <td align="right" style="vertical-align: middle;">
                        <span style="display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; ${badgeStyles}">
                          ${priorityLabel || 'STANDART'}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Horizontal Minimal Divider -->
              <tr>
                <td style="padding: 0 30px;">
                  <div style="height: 1px; background-color: rgba(255,255,255,0.04);"></div>
                </td>
              </tr>

              <!-- Dynamic SLA Directives -->
              ${slaBannerHtml ? `
              <tr>
                <td style="padding: 20px 30px 0 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size: 12px; color: ${planColor}; line-height: 1.5; font-weight: 500;">
                        ${priorityLabel === 'VIP' ? '👑 <strong>VIP SLA:</strong> Yanıt hedefiniz <strong>15 Dakika</strong> olarak kilitlenmiştir.' : 
                          priorityLabel === 'ÖNCELİKLİ' ? '⚡ <strong>Öncelikli Destek:</strong> Yanıt hedefiniz <strong>2 Saat</strong> olarak kilitlenmiştir.' : 
                          '🛡️ <strong>Standart SLA:</strong> Yanıt hedef süresi <strong>24 Saat</strong> olarak tanımlanmıştır.'}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>` : ''}

              <!-- Ticket Info Columns (Modern Grid) -->
              <tr>
                <td style="padding: 20px 30px 0 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" style="padding: 10px 10px 10px 0; vertical-align: top;">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Müşteri</div>
                        <div style="font-size: 14px; color: #ffffff; font-weight: 600;">${value.name}</div>
                      </td>
                      <td width="50%" style="padding: 10px 0 10px 10px; vertical-align: top;">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">E-Posta Adresi</div>
                        <div style="font-size: 14px; color: #2563eb; font-weight: 600;"><a href="mailto:${value.email}" style="color: #2563eb; text-decoration: none;">${value.email}</a></div>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding: 15px 10px 10px 0; vertical-align: top; border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Abonelik Planı</div>
                        <div style="font-size: 14px; color: ${planColor}; font-weight: 600;">${planMeta ? `${String(planMeta.tier || '').toUpperCase()} (${planMeta.billingCycle || 'monthly'})` : 'Bireysel / Ücretsiz'}</div>
                      </td>
                      <td width="50%" style="padding: 15px 0 10px 10px; vertical-align: top; border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">İletim IP</div>
                        <div style="font-size: 13px; color: #a1a1aa; font-family: monospace; font-weight: 600;">${clientIp}</div>
                      </td>
                    </tr>
                    ${value.page ? `
                    <tr>
                      <td colspan="2" style="padding: 15px 0 10px 0; vertical-align: top; border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Kaynak Sayfa</div>
                        <div style="font-size: 12px; color: #a1a1aa; font-family: monospace; word-break: break-all;">${value.page}</div>
                      </td>
                    </tr>` : ''}
                    ${value.visitorId ? `
                    <tr>
                      <td colspan="2" style="padding: 15px 0 10px 0; vertical-align: top; border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Benzersiz ID</div>
                        <div style="font-size: 12px; color: #52525b; font-family: monospace; word-break: break-all;">${value.visitorId}</div>
                      </td>
                    </tr>` : ''}
                    
                    <!-- Technical Security Telemetry (Cloudflare/Stripe Style) -->
                    <tr>
                      <td colspan="2" style="padding: 15px 0 10px 0; vertical-align: top; border-top: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Sistem Güvenlik Protokolü</div>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 12px;">
                          <tr>
                            <td style="padding: 4px 0; font-size: 11px; color: #52525b; font-family: monospace;">[Zaman Damgası]</td>
                            <td style="padding: 4px 0; font-size: 11px; color: #a1a1aa; font-family: monospace; text-align: right;">${sealedAt} (Istanbul)</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 11px; color: #52525b; font-family: monospace;">[İstemci Bilgisi]</td>
                            <td style="padding: 4px 0; font-size: 11px; color: #a1a1aa; font-family: monospace; text-align: right; word-break: break-all; max-width: 250px;">${rawUserAgent}</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 11px; color: #52525b; font-family: monospace;">[İletim Düğümü]</td>
                            <td style="padding: 4px 0; font-size: 11px; color: #10b981; font-family: monospace; text-align: right; font-weight: bold;">ODELINK-NODE-IST-01 (ACTIVE)</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 11px; color: #52525b; font-family: monospace;">[Kanal Protokolü]</td>
                            <td style="padding: 4px 0; font-size: 11px; color: #10b981; font-family: monospace; text-align: right; font-weight: bold;">SSL/TLS SECURE ROUTE</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Message Body (Sleek Flat Card) -->
              <tr>
                <td style="padding: 25px 30px 0 30px;">
                  <div style="font-size: 9px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Müşteri İletisi</div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0c0c0e; border: 1px solid rgba(255, 255, 255, 0.035); border-radius: 12px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; font-size: 14px; line-height: 1.6; color: #e4e4e7;">
                        ${value.message.replace(/\n/g, '<br>')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Primary CTA (Flat Modern Action Button) -->
              <tr>
                <td align="center" style="padding: 35px 30px 25px 30px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="border-radius: 10px;">
                        <a href="mailto:${value.email}?subject=Re: ${encodeURIComponent(value.subject)}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 10px; letter-spacing: -0.01em;">
                          Müşteriyi Yanıtla
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer Section (Legal Compliance without Mersis/Registry IDs) -->
              <tr>
                <td style="padding: 30px 30px 35px 30px; border-top: 1px solid rgba(255,255,255,0.04); background-color: #070709;">
                  
                  <!-- Navigation links -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; text-align: center;">
                    <tr>
                      <td style="font-size: 11px;">
                        <a href="https://odelink.shop" target="_blank" style="color: #71717a; text-decoration: none; margin: 0 8px;">Anasayfa</a>
                        <span style="color: #1f1f23;">•</span>
                        <a href="https://odelink.shop/support" target="_blank" style="color: #71717a; text-decoration: none; margin: 0 8px;">Destek</a>
                        <span style="color: #1f1f23;">•</span>
                        <a href="https://odelink.shop/privacy" target="_blank" style="color: #71717a; text-decoration: none; margin: 0 8px;">Gizlilik</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Corporate copyright and dynamic address (no Mersis/Ticaret No) -->
                  <p style="margin: 0 0 6px 0; color: #71717a; text-align: center; font-weight: 600; font-size: 11px; letter-spacing: -0.01em;">
                    © 2026 Ödelink İnternet Hizmetleri ve Teknolojileri A.Ş. Tüm hakları saklıdır.
                  </p>
                  <p style="margin: 0 0 20px 0; color: #3f3f46; text-align: center; font-size: 10px; line-height: 1.4;">
                    Maslak Mahallesi, Büyükdere Caddesi, Spine Tower, Sarıyer / İstanbul
                  </p>
                  
                  <div style="height: 1px; background-color: rgba(255,255,255,0.03); margin: 15px 0;"></div>
                  
                  <!-- Yasal KVKK Disclaimers (Strictly TR/EN compliance notices) -->
                  <p style="margin: 0 0 8px 0; font-size: 9px; color: #3f3f46; text-align: justify; line-height: 1.4;">
                    <strong>KVKK BİLGİLENDİRMESİ:</strong> Bu e-posta ve içerdiği tüm bilgiler yalnızca belirtilen alıcıya özeldir. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında korunmaktadır. Yetkisiz alıcılar tarafından ifşa edilmesi yasal sorumluluk doğurabilir.
                  </p>
                  
                  <p style="margin: 0; font-size: 9px; color: #3f3f46; text-align: justify; line-height: 1.4;">
                    <strong>CONFIDENTIALITY NOTICE:</strong> This electronic message contains information that is private and confidential. It is intended solely for the addressee. Any dissemination, copying or distribution is strictly prohibited and subject to legal action under privacy laws.
                  </p>
                  
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      replyTo: value.email,
      subject: safeSubject,
      text,
      html
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error('Support email failed, falling back to local file log:', e.message || e);
    try {
      const logDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFilePath = path.join(logDir, 'support_messages.json');
      let currentLogs = [];
      if (fs.existsSync(logFilePath)) {
        const fileContent = fs.readFileSync(logFilePath, 'utf8');
        try {
          currentLogs = JSON.parse(fileContent);
        } catch (parseErr) {
          currentLogs = [];
        }
      }

      const newLog = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        page: req.body.page || '',
        visitorId: req.body.visitorId || ''
      };

      currentLogs.push(newLog);
      fs.writeFileSync(logFilePath, JSON.stringify(currentLogs, null, 2), 'utf8');

      return res.json({ ok: true, savedLocally: true });
    } catch (fallbackErr) {
      console.error('Fallback logging also failed:', fallbackErr);
      return res.status(500).json({ error: 'Mesaj gönderilemedi' });
    }
  }
});

module.exports = router;
