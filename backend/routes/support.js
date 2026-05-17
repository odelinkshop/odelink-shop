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
    const text = [
      `Ad: ${value.name}`,
      `E-posta: ${value.email}`,
      planMeta ? `Paket: ${String(planMeta.tier || '').toUpperCase()} (${planMeta.billingCycle || 'monthly'})` : null,
      value.page ? `Sayfa: ${value.page}` : null,
      value.visitorId ? `VisitorId: ${value.visitorId}` : null,
      '',
      value.message
    ].filter(Boolean).join('\n');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      replyTo: value.email,
      subject: safeSubject,
      text
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
