const express = require('express');
const { enableMaintenanceMode, disableMaintenanceMode, isMaintenanceMode } = require('../middleware/maintenanceMode');

const router = express.Router();

// Enable maintenance mode
router.post('/enable', (req, res) => {
  const success = enableMaintenanceMode();
  if (success) {
    return res.json({ 
      ok: true, 
      message: 'Maintenance mode enabled',
      maintenance: true 
    });
  }
  return res.status(500).json({ 
    error: 'Failed to enable maintenance mode' 
  });
});

// Disable maintenance mode
router.post('/disable', (req, res) => {
  const success = disableMaintenanceMode();
  if (success) {
    return res.json({ 
      ok: true, 
      message: 'Maintenance mode disabled',
      maintenance: false 
    });
  }
  return res.status(500).json({ 
    error: 'Failed to disable maintenance mode' 
  });
});

// Check maintenance status
router.get('/status', (req, res) => {
  const maintenance = isMaintenanceMode();
  return res.json({ 
    maintenance,
    message: maintenance ? 'Site is in maintenance mode' : 'Site is operational'
  });
});


// Migration: Add subdomain tracking columns
router.get('/migrate/subdomain-rights', async (req, res) => {
  try {
    await pool.query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS subdomain_change_count INTEGER DEFAULT 0');
    await pool.query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS last_subdomain_change_at TIMESTAMP');
    res.json({ success: true, message: 'Subdomain rights columns added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
