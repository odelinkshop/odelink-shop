const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const AuthSession = require('../models/AuthSession');
const User = require('../models/User');
const Site = require('../models/Site');
const Subscription = require('../models/Subscription');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { withTransaction } = require('../utils/transactions');
const { normalizeDisplayName, normalizePhone } = require('../utils/account');
const shopierRoutes = require('./shopier');
const {
  profileSchema,
  changePasswordSchema,
  deleteAccountSchema
} = require('../validation/accountSchemas');

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const caps = await Subscription.getUserCapabilities(req.userId).catch(() => null);
    if (!caps?.tier) {
      return res.status(403).json({ error: 'Bu özelliği kullanmak için bir plan satın almalısınız.', code: 'PAYWALL' });
    }

    const [userResult, sitesResult, statsResult, subscriptionResult] = await Promise.allSettled([
      User.findById(req.userId),
      Site.findDashboardByUserId(req.userId),
      Site.getSiteStats(req.userId),
      User.getSubscriptionDetails(req.userId)
    ]);

    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null;

    const resolvedUser = user || (subscription ? {
      id: subscription.id,
      name: subscription.name,
      email: subscription.email,
      phone: subscription.phone,
      subscription_id: subscription.subscription_id,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at
    } : null);

    if (!resolvedUser) {
      console.error('Dashboard error: user_not_found', {
        userId: req.userId,
        userError: userResult.status === 'rejected' ? userResult.reason?.message || String(userResult.reason) : null,
        subscriptionError: subscriptionResult.status === 'rejected' ? subscriptionResult.reason?.message || String(subscriptionResult.reason) : null
      });
      return res.status(404).json({ error: 'Kullanici bulunamadi' });
    }

    const sites = sitesResult.status === 'fulfilled' && Array.isArray(sitesResult.value)
      ? sitesResult.value
      : [];

    const siteStats = statsResult.status === 'fulfilled' && statsResult.value
      ? statsResult.value
      : {
        total_sites: String(sites.length),
        active_sites: String(sites.filter((site) => String(site?.status || '').toLowerCase() === 'active').length),
        recent_sites: '0'
      };

    if (
      userResult.status === 'rejected'
      || sitesResult.status === 'rejected'
      || statsResult.status === 'rejected'
      || subscriptionResult.status === 'rejected'
    ) {
      console.warn('Dashboard partial response', {
        userId: req.userId,
        userError: userResult.status === 'rejected' ? userResult.reason?.message || String(userResult.reason) : null,
        sitesError: sitesResult.status === 'rejected' ? sitesResult.reason?.message || String(sitesResult.reason) : null,
        statsError: statsResult.status === 'rejected' ? statsResult.reason?.message || String(statsResult.reason) : null,
        subscriptionError: subscriptionResult.status === 'rejected' ? subscriptionResult.reason?.message || String(subscriptionResult.reason) : null
      });
    }

    res.json({
      user: {
        id: resolvedUser.id,
        name: resolvedUser.name,
        email: resolvedUser.email,
        phone: resolvedUser.phone
      },
      sites,
      stats: siteStats,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard verileri alinamadi' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { error, value } = profileSchema.validate(req.body || {}, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'Gecersiz profil bilgisi' });
    }

    const query = `
      UPDATE users
      SET name = $1, phone = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, phone
    `;

    const result = await pool.query(query, [
      normalizeDisplayName(value.name),
      normalizePhone(value.phone) || null,
      req.userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanici bulunamadi' });
    }

    res.json({
      message: 'Profil basariyla guncellendi',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profil guncellenemedi' });
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body || {}, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'Mevcut sifre ve yeni sifre gereklidir' });
    }

    const user = await User.findWithPasswordById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi' });
    }

    const isValidPassword = await User.verifyPassword(value.currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mevcut sifre hatali' });
    }

    const isSamePassword = await User.verifyPassword(value.newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'Yeni sifre mevcut sifre ile ayni olamaz' });
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, 12);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.userId]
    );
    await AuthSession.revokeAllForUser(req.userId, 'password_change');

    res.json({ message: 'Sifre basariyla guncellendi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Sifre guncellenemedi' });
  }
});

router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { error, value } = deleteAccountSchema.validate(req.body || {}, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'Hesap silmek icin mevcut sifre gereklidir' });
    }

    const user = await User.findWithPasswordById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi' });
    }

    const isValidPassword = await User.verifyPassword(value.currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mevcut sifre hatali' });
    }

    const sites = await pool.query(
      'SELECT id, subdomain FROM sites WHERE user_id = $1',
      [req.userId]
    );
    const siteRows = Array.isArray(sites.rows) ? sites.rows : [];
    const subdomains = siteRows.map((r) => (r?.subdomain || '').toString().trim().toLowerCase()).filter(Boolean);
    const siteIds = siteRows.map((r) => (r?.id || '').toString().trim()).filter(Boolean);

    try {
      if (typeof shopierRoutes?.clearSyncJobsForSubdomains === 'function') {
        shopierRoutes.clearSyncJobsForSubdomains(subdomains);
      }
    } catch (e) {
      void e;
    }

    try {
      const logosDir = path.join(__dirname, '..', 'uploads', 'logos');
      for (const siteId of siteIds) {
        if (!siteId) continue;
        let files = [];
        try {
          files = fs.readdirSync(logosDir);
        } catch (e) {
          void e;
          continue;
        }
        for (const file of files) {
          if (!file || typeof file !== 'string') continue;
          if (!file.startsWith(`${siteId}-`)) continue;
          try {
            fs.unlinkSync(path.join(logosDir, file));
          } catch (e) {
            void e;
          }
        }
      }
    } catch (e) {
      void e;
    }

    try {
      await AuthSession.revokeAllForUser(req.userId, 'account_delete');
    } catch (e) {
      void e;
    }

    await withTransaction(pool, async (client) => {
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.userId]);
      if (result.rowCount === 0) {
        const deleteError = new Error('user_not_found');
        deleteError.code = 'USER_NOT_FOUND';
        throw deleteError;
      }
      return result.rows[0];
    });

    res.json({ message: 'Hesap basariyla silindi' });
  } catch (error) {
    if (error?.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'Kullanici bulunamadi' });
    }
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Hesap silinemedi' });
  }
});

module.exports = router;
