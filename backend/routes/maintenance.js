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

module.exports = router;
