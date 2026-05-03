/**
 * DATABASE BACKUP SERVICE
 * Otomatik PostgreSQL backup sistemi
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

// Backup klasörü
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Backup ayarları
const BACKUP_CONFIG = {
  maxBackups: 7,           // Son 7 günlük backup tut
  backupInterval: 24 * 60 * 60 * 1000,  // 24 saat
  compressionEnabled: true
};

/**
 * Backup klasörünü oluştur
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('📁 Backup klasörü oluşturuldu:', BACKUP_DIR);
  }
}

/**
 * Eski backup'ları temizle (son 7 günü tut)
 */
function cleanOldBackups() {
  try {
    ensureBackupDir();
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql') || f.endsWith('.sql.gz'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Son 7 backup'ı tut, gerisini sil
    if (files.length > BACKUP_CONFIG.maxBackups) {
      const toDelete = files.slice(BACKUP_CONFIG.maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log('🗑️ Eski backup silindi:', file.name);
      });
    }
  } catch (error) {
    console.error('❌ Eski backup temizleme hatası:', error);
  }
}

/**
 * PostgreSQL backup al (pg_dump kullanarak)
 */
async function createBackup() {
  try {
    console.log('🔄 Database backup başladı...');
    
    ensureBackupDir();

    // Timestamp ile dosya adı
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
    const filename = `odelink-backup-${timestamp}-${time}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Database bağlantı bilgileri
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL bulunamadı');
    }

    // pg_dump komutu
    const command = `pg_dump "${dbUrl}" > "${filepath}"`;

    // Backup al
    await execPromise(command);

    // Dosya boyutunu kontrol et
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup oluşturuldu: ${filename} (${sizeMB} MB)`);

    // Compression (opsiyonel)
    if (BACKUP_CONFIG.compressionEnabled) {
      try {
        await execPromise(`gzip "${filepath}"`);
        const gzPath = `${filepath}.gz`;
        const gzStats = fs.statSync(gzPath);
        const gzSizeMB = (gzStats.size / (1024 * 1024)).toFixed(2);
        console.log(`🗜️ Backup sıkıştırıldı: ${filename}.gz (${gzSizeMB} MB)`);
      } catch (gzError) {
        console.log('⚠️ Compression başarısız (gzip yok), normal backup kullanılıyor');
      }
    }

    // Eski backup'ları temizle
    cleanOldBackups();

    return {
      success: true,
      filename,
      size: sizeMB,
      path: filepath,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Backup hatası:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Backup'ı geri yükle
 */
async function restoreBackup(backupFilename) {
  try {
    console.log('🔄 Backup geri yükleniyor:', backupFilename);

    const filepath = path.join(BACKUP_DIR, backupFilename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Backup dosyası bulunamadı: ' + backupFilename);
    }

    // Database bağlantı bilgileri
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL bulunamadı');
    }

    // Eğer .gz ise önce açalım
    let sqlFile = filepath;
    if (filepath.endsWith('.gz')) {
      await execPromise(`gunzip -k "${filepath}"`);
      sqlFile = filepath.replace('.gz', '');
    }

    // psql ile geri yükle
    const command = `psql "${dbUrl}" < "${sqlFile}"`;
    await execPromise(command);

    console.log('✅ Backup geri yüklendi:', backupFilename);

    return {
      success: true,
      filename: backupFilename,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Restore hatası:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Mevcut backup'ları listele
 */
function listBackups() {
  try {
    ensureBackupDir();
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql') || f.endsWith('.sql.gz'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          created: stats.mtime.toISOString(),
          path: path.join(BACKUP_DIR, f)
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return {
      success: true,
      backups: files,
      total: files.length
    };

  } catch (error) {
    console.error('❌ Backup listesi hatası:', error);
    return {
      success: false,
      error: error.message,
      backups: []
    };
  }
}

/**
 * Otomatik backup cron başlat (her gün saat 03:00)
 */
function startBackupCron() {
  console.log('⏰ Otomatik backup cron başlatıldı (her gün saat 03:00)');

  // İlk backup'ı 1 dakika sonra al (test için)
  setTimeout(() => {
    createBackup().catch(e => console.error('Cron backup error:', e));
  }, 60000);

  // Her dakika kontrol et, saat 03:00'da backup al
  setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Saat 03:00 - 03:01 arasında backup al
    if (hour === 3 && minute === 0) {
      createBackup().catch(e => console.error('Cron backup error:', e));
    }
  }, 60000); // Her dakika kontrol et
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  startBackupCron,
  cleanOldBackups,
  BACKUP_DIR
};
