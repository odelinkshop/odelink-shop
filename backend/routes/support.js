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
    
    // Choose styling variables based on support level
    let badgeClass = 'badge-standard';
    let planColor = '#a1a1aa';
    if (priorityLabel === 'VIP') {
      badgeClass = 'badge-vip';
      planColor = '#eab308';
    } else if (priorityLabel === 'ÖNCELİKLİ') {
      badgeClass = 'badge-priority';
      planColor = '#3b82f6';
    }

    const text = [
      `Ad: ${value.name}`,
      `E-posta: ${value.email}`,
      planMeta ? `Paket: ${String(planMeta.tier || '').toUpperCase()} (${planMeta.billingCycle || 'monthly'})` : null,
      value.page ? `Sayfa: ${value.page}` : null,
      value.visitorId ? `VisitorId: ${value.visitorId}` : null,
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
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #050505;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
        }
        .card {
          background-color: #0b0b0c;
          border: 1px solid #1a1a1c;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1a1a1c;
          padding-bottom: 25px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.05em;
          text-transform: uppercase;
          color: #ffffff;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .badge-vip {
          background-color: rgba(234, 179, 8, 0.1);
          color: #eab308;
          border: 1px solid rgba(234, 179, 8, 0.2);
        }
        .badge-priority {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .badge-standard {
          background-color: rgba(255, 255, 255, 0.05);
          color: #a1a1aa;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 15px;
          margin-top: 25px;
        }
        .meta-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .meta-row td {
          padding: 12px 0;
          border-bottom: 1px solid #141416;
          font-size: 14px;
        }
        .meta-label {
          color: #71717a;
          font-weight: 600;
          width: 30%;
        }
        .meta-value {
          color: #ffffff;
          font-weight: 700;
        }
        .message-box {
          background-color: #111113;
          border: 1px solid #1a1a1c;
          border-radius: 16px;
          padding: 25px;
          color: #e4e4e7;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-bottom: 30px;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #52525b;
          margin-top: 40px;
          line-height: 1.5;
        }
        .footer-logo {
          font-weight: 800;
          color: #27272a;
          letter-spacing: 0.1em;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <span class="logo">Ödelink</span>
            <span class="badge ${badgeClass}">${priorityLabel || 'STANDART'}</span>
          </div>
          
          <div class="section-title">Talep Bilgileri</div>
          <table class="meta-grid">
            <tr class="meta-row">
              <td class="meta-label">Müşteri Adı</td>
              <td class="meta-value">${value.name}</td>
            </tr>
            <tr class="meta-row">
              <td class="meta-label">E-Posta</td>
              <td class="meta-value"><a href="mailto:${value.email}" style="color: #3b82f6; text-decoration: none;">${value.email}</a></td>
            </tr>
            <tr class="meta-row">
              <td class="meta-label">Abonelik Planı</td>
              <td class="meta-value" style="color: ${planColor}">${planMeta ? `${String(planMeta.tier || '').toUpperCase()} (${planMeta.billingCycle || 'monthly'})` : 'Bireysel (Giriş Yapılmadı)'}</td>
            </tr>
            ${value.page ? `
            <tr class="meta-row">
              <td class="meta-label">Gönderilen Sayfa</td>
              <td class="meta-value" style="font-family: monospace; font-size: 12px;">${value.page}</td>
            </tr>` : ''}
            ${value.visitorId ? `
            <tr class="meta-row">
              <td class="meta-label">Visitor ID</td>
              <td class="meta-value" style="font-family: monospace; font-size: 12px; color: #52525b;">${value.visitorId}</td>
            </tr>` : ''}
          </table>
          
          <div class="section-title">Müşteri Mesajı</div>
          <div class="message-box">${value.message.replace(/\n/g, '<br>')}</div>
          
          <div class="footer">
            Bu e-posta Ödelink Akıllı Destek altyapısı tarafından otomatik olarak iletilmiştir.<br>
            Müşteriye doğrudan bu maili yanıtlayarak (Reply) cevap verebilirsiniz.
            <div class="footer-logo">ODELINK SECURE SYSTEM</div>
          </div>
        </div>
      </div>
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
