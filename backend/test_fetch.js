const { fetchShopierCatalog } = require('./services/shopierCatalogService');

async function run() {
  try {
    const catalog = await fetchShopierCatalog('https://www.shopier.com/KramponLab', { debug: true, skipDetails: true });
    console.log('Total products:', catalog.products?.length);
  } catch (e) {
    console.error('ERROR:', e);
  }
}

run();
