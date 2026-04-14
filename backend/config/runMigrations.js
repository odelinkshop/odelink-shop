const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found, skipping migrations');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`  ⏳ Running migration: ${file}`);
      await pool.query(sql);
      console.log(`  ✅ Migration completed: ${file}`);
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
}

module.exports = { runMigrations };
