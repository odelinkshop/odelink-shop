const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

/**
 * @route   GET api/editor/:siteId
 * @desc    Get current site settings for editor
 * @access  Private
 */
router.get('/:siteId', auth, async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, subdomain, settings FROM sites WHERE id = $1 AND user_id = $2',
      [siteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Site bulunamadı veya yetkiniz yok.' });
    }

    const site = result.rows[0];
    
    // Default settings if empty
    const defaultSettings = {
      design: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#ff0000',
        fontFamily: 'Inter, sans-serif'
      },
      content: {
        announcementBar: 'ÜCRETSİZ KARGO VE ÖZEL İNDİRİMLER!',
        heroTitle: 'YENİ SEZON KOLEKSİYONU',
        heroSubtitle: 'PREMIUM MENSWEAR — İSTANBUL, TR',
        heroButtonText: 'ŞİMDİ KEŞFET'
      },
      sections: {
        featuredProducts: { enabled: true, title: 'Öne Çıkanlar' },
        newArrivals: { enabled: true, title: 'Yeni Gelenler' }
      },
      manualProducts: []
    };

    const settings = { ...defaultSettings, ...(site.settings || {}) };

    res.json({
      id: site.id,
      name: site.name,
      subdomain: site.subdomain,
      // Theme field removed - no longer needed
      settings
    });
  } catch (err) {
    console.error('❌ Editor GET Error:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

/**
 * @route   PUT api/editor/:siteId
 * @desc    Update site settings from editor
 * @access  Private
 */
router.put('/:siteId', auth, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ message: 'Ayarlar gerekli.' });
    }

    // Update settings in JSONB field
    const result = await pool.query(
      'UPDATE sites SET settings = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id, settings',
      [JSON.stringify(settings), siteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Site bulunamadı veya yetkiniz yok.' });
    }

    res.json({
      message: 'Ayarlar başarıyla kaydedildi.',
      settings: result.rows[0].settings
    });
  } catch (err) {
    console.error('❌ Editor PUT Error:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
