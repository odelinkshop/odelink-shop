const pool = require('../backend/config/database');

async function main() {
  const email = (process.argv[2] || 'odelinkdestek@gmail.com').toString().trim();
  if (!email) {
    throw new Error('Email gerekli. Örn: node scripts/expire_trial_user.js odelinkdestek@gmail.com');
  }

  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_consumed BOOLEAN DEFAULT FALSE");

  const before = await pool.query(
    'SELECT id, email, trial_started_at, trial_ends_at, trial_consumed FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );
  console.log('BEFORE', before.rows[0] || null);

  await pool.query(
    "UPDATE users SET trial_ends_at = NOW() - INTERVAL '1 minute', updated_at = NOW() WHERE LOWER(email) = LOWER($1)",
    [email]
  );

  const after = await pool.query(
    'SELECT id, email, trial_started_at, trial_ends_at, trial_consumed FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  );
  console.log('AFTER', after.rows[0] || null);

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await pool.end();
  } catch (endErr) {
    void endErr;
  }
  process.exit(1);
});
