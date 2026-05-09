const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

// Deploy webhook - Güvenlik için secret key
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'odelink-deploy-2024';

router.post('/deploy', (req, res) => {
  const { secret } = req.body;
  
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  console.log('🚀 Deploy webhook triggered!');
  
  // Önce response gönder
  res.json({ 
    success: true, 
    message: 'Deploy started, container will restart'
  });
  
  // Sonra container'ı restart et (async)
  setTimeout(() => {
    const deployScript = `
      cd /home/odelink/odelink-shop && \
      git pull origin main && \
      docker-compose down && \
      docker-compose build --no-cache && \
      docker-compose up -d
    `;
    
    exec(deployScript, (error, stdout, stderr) => {
      if (error) {
        console.error('Deploy error:', error);
        return;
      }
      
      console.log('✅ Deploy completed!');
      console.log(stdout);
    });
  }, 1000);
});

module.exports = router;
