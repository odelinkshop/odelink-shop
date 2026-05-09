const pool = require('./config/database');
pool.query("SELECT subdomain, settings->'products_data'->0->'images' as imgs FROM sites WHERE subdomain LIKE '%magazam%'")
  .then(res => {
    console.log(res.rows);
    process.exit();
  })
  .catch(e => { console.error(e); process.exit(); });
