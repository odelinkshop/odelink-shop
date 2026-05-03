const Site = require('./models/Site');
const { syncSite } = require('./services/shopierSyncService');

async function triggerGCModaSync() {
  const shopierUrl = 'https://www.shopier.com/GCMODA';
  console.log(`🔍 Finding site for: ${shopierUrl}`);
  
  try {
    const site = await Site.findMostRecentByShopierUrl(shopierUrl);
    if (!site) {
      console.error('❌ Site not found in database!');
      return;
    }
    
    console.log(`✅ Found site: ${site.id} (${site.name})`);
    console.log(`🚀 Starting sync...`);
    
    const result = await syncSite(site.id);
    if (result.success) {
      console.log('🎉 Sync completed successfully!');
      console.log('Stats:', result.stats);
    } else {
      console.error('❌ Sync failed:', result.error);
    }
  } catch (err) {
    console.error('❌ Error during script execution:', err);
  } finally {
    process.exit();
  }
}

triggerGCModaSync();
