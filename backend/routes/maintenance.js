const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const MAINTENANCE_FLAG = path.join(__dirname, '..', '.maintenance');

// Bakım modu durumunu kontrol et
router.get('/status', (req, res) => {
  const isMaintenanceMode = fs.existsSync(MAINTENANCE_FLAG);
  res.json({ maintenanceMode: isMaintenanceMode });
});

// Bakım modunu aktif et (sadece admin)
router.post('/enable', (req, res) => {
  try {
    fs.writeFileSync(MAINTENANCE_FLAG, new Date().toISOString());
    console.log('🔧 Bakım modu aktif edildi');
    res.json({ success: true, message: 'Bakım modu aktif' });
  } catch (error) {
    console.error('Bakım modu aktif edilemedi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bakım modunu kapat (sadece admin)
router.post('/disable', (req, res) => {
  try {
    if (fs.existsSync(MAINTENANCE_FLAG)) {
      fs.unlinkSync(MAINTENANCE_FLAG);
    }
    console.log('✅ Bakım modu kapatıldı');
    res.json({ success: true, message: 'Bakım modu kapatıldı' });
  } catch (error) {
    console.error('Bakım modu kapatılamadı:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
