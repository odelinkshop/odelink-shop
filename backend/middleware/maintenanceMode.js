const fs = require('fs');
const path = require('path');

const MAINTENANCE_FLAG_FILE = path.join(__dirname, '../.maintenance');

const isMaintenanceMode = () => {
  try {
    return fs.existsSync(MAINTENANCE_FLAG_FILE);
  } catch (error) {
    return false;
  }
};

const enableMaintenanceMode = () => {
  try {
    fs.writeFileSync(MAINTENANCE_FLAG_FILE, new Date().toISOString());
    console.log('✅ Maintenance mode enabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to enable maintenance mode:', error);
    return false;
  }
};

const disableMaintenanceMode = () => {
  try {
    if (fs.existsSync(MAINTENANCE_FLAG_FILE)) {
      fs.unlinkSync(MAINTENANCE_FLAG_FILE);
      console.log('✅ Maintenance mode disabled');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to disable maintenance mode:', error);
    return false;
  }
};

const maintenanceMiddleware = (req, res, next) => {
  // Skip maintenance check for these paths
  const allowedPaths = [
    '/api/maintenance/enable',
    '/api/maintenance/disable',
    '/api/maintenance/status',
    '/api/ready',
    '/api/health'
  ];

  if (allowedPaths.includes(req.path)) {
    return next();
  }

  if (isMaintenanceMode()) {
    // Serve maintenance page for HTML requests
    if (req.accepts('html')) {
      const maintenancePath = path.join(__dirname, '../frontend-build/maintenance.html');
      if (fs.existsSync(maintenancePath)) {
        return res.status(503).sendFile(maintenancePath);
      }
    }
    
    // Return JSON for API requests
    return res.status(503).json({
      error: 'Site bakımda',
      message: 'Kısa bir güncelleme yapıyoruz. Lütfen birkaç dakika sonra tekrar deneyin.',
      maintenance: true
    });
  }

  next();
};

module.exports = {
  maintenanceMiddleware,
  isMaintenanceMode,
  enableMaintenanceMode,
  disableMaintenanceMode
};
