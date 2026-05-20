const { Client } = require('pg');
require('dotenv').config();

async function test() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Find site by domain containing 'akkesl' or similar
    const resSite = await client.query("SELECT id, subdomain, settings FROM sites WHERE subdomain ILIKE '%akkesl%' OR settings::text ILIKE '%akkesl%'");
    console.log("Sites found:", resSite.rows.map(r => ({ id: r.id, subdomain: r.subdomain })));
    
    if (resSite.rows.length > 0) {
      const siteId = resSite.rows[0].id;
      // Get products of this site
      const resProducts = await client.query("SELECT id, title, price, slug, url, \"shopierUrl\", variations, sizes FROM products WHERE site_id = $1", [siteId]);
      console.log("Products found:");
      resProducts.rows.forEach(p => {
        console.log(`- ID: ${p.id}, Title: ${p.title}, Slug: ${p.slug}, URL: ${p.url || p.shopierUrl}`);
        console.log(`  Variations: ${JSON.stringify(p.variations)}`);
        console.log(`  Sizes: ${JSON.stringify(p.sizes)}`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

test();
