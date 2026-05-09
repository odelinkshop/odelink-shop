const express = require('express');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Subscription = require('../models/Subscription');

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
    if (e && e.code === 'EMAIL_MISCONFIG') {
      return res.status(500).json({ error: 'E-posta gönderimi yapılandırılmadı (EMAIL_HOST/EMAIL_USER/EMAIL_PASS).' });
    }
    return res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

module.exports = router;
