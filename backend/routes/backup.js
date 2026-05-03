/**
 * BACKUP ROUTES
 * Database backup yönetimi endpoint'leri (ADMIN ONLY)
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  createBackup,
  restoreBackup,
  listBackups
} = require('../services/databaseBackupService');

/**
 * Manuel backup oluştur
 * POST /api/backup/create
 */
router.post('/create', auth, adminOnly, async (req, res) => {
  try {
    console.log('📦 Manuel backup isteği:', req.user.id);

    const result = await createBackup();

    if (result.success) {
      res.json({
        success: true,
        message: 'Backup başarıyla oluşturuldu',
        backup: {
          filename: result.filename,
          size: result.size,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backup oluşturulamadı',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Backup create error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup oluşturma hatası',
      error: error.message
    });
  }
});

/**
 * Backup'ları listele
 * GET /api/backup/list
 */
router.get('/list', auth, adminOnly, async (req, res) => {
  try {
    const result = listBackups();

    res.json({
      success: true,
      backups: result.backups,
      total: result.total
    });

  } catch (error) {
    console.error('Backup list error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup listesi alınamadı',
      error: error.message
    });
  }
});

/**
 * Backup'ı geri yükle
 * POST /api/backup/restore
 */
router.post('/restore', auth, adminOnly, async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Backup dosya adı gerekli'
      });
    }

    console.log('🔄 Backup restore isteği:', filename, 'by', req.user.id);

    const result = await restoreBackup(filename);

    if (result.success) {
      res.json({
        success: true,
        message: 'Backup başarıyla geri yüklendi',
        filename: result.filename,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backup geri yüklenemedi',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Backup restore error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup geri yükleme hatası',
      error: error.message
    });
  }
});

module.exports = router;
