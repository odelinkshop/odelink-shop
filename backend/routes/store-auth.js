const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');
const StoreCustomer = require('../models/StoreCustomer');
const Site = require('../models/Site');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().allow('').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

// Middleware to resolve site from host
const resolveSite = async (req, res, next) => {
  const host = (req.headers['x-odelink-host'] || req.headers.host || '').toString().toLowerCase().split(':')[0];
  const subdomain = host.split('.')[0];
  
  const site = await Site.findBySubdomain(subdomain);
  if (!site) return res.status(404).json({ error: 'Store not found' });
  
  req.site = site;
  next();
};

// Register
router.post('/register', resolveSite, async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, phone } = req.body;
    
    const existing = await StoreCustomer.findByEmail(req.site.id, email);
    if (existing) return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });

    const customer = await StoreCustomer.create({
      siteId: req.site.id,
      name,
      email,
      password,
      phone
    });

    const token = StoreCustomer.generateToken(customer.id, req.site.id);
    res.status(201).json({ customer, token });
  } catch (e) {
    res.status(500).json({ error: 'Kayıt işlemi başarısız.' });
  }
});

// Login
router.post('/login', resolveSite, async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;
    const customer = await StoreCustomer.findByEmail(req.site.id, email);
    
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      return res.status(401).json({ error: 'Email veya şifre hatalı.' });
    }

    const token = StoreCustomer.generateToken(customer.id, req.site.id);
    res.json({ 
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }, 
      token 
    });
  } catch (e) {
    res.status(500).json({ error: 'Giriş yapılamadı.' });
  }
});

// Forgot Password
router.post('/forgot-password', resolveSite, async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await StoreCustomer.findByEmail(req.site.id, email);
    
    if (!customer) return res.json({ ok: true }); // Silent fail for security

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

    // Store reset code (reusing table structure concept)
    await pool.query(
      'INSERT INTO password_reset_tokens (id, email, code_hash, expires_at, user_id) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), email.toLowerCase().trim(), code, expiresAt, customer.id]
    );

    // TODO: Send real email using store SMTP or global SMTP
    console.log(`[AUTH] Reset code for ${email} on ${req.site.subdomain}: ${code}`);
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'İşlem başarısız.' });
  }
});

// Profile (Me)
router.get('/me', resolveSite, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    const customer = await StoreCustomer.findById(decoded.customerId);
    if (!customer) return res.status(404).json({ error: 'User not found' });
    
    res.json(customer);
  } catch (e) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

module.exports = router;
