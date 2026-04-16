const { execFileSync } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Theme Scraper Service
 * Framer sitesini indirip backend/themes/ klasörüne kaydeder
 */
class ThemeScraperService {
  /**
   * Framer sitesini indir ve kaydet
   * @param {string} url - Framer site URL'i (örn: https://odelinktheme.framer.ai)
   * @param {string} targetDir - Hedef klasör (örn: backend/themes/wearix)
   * @returns {Promise<{success: boolean, message: string, files: string[]}>}
   */
  async scrapeFramerSite(url, targetDir) {
    console.log(`🔄 Framer sitesi indiriliyor: ${url}`);
    console.log(`📁 Hedef klasör: ${targetDir}`);

    try {
      // Hedef klasörü oluştur
      await fs.mkdir(targetDir, { recursive: true });

      // wget komutunu oluştur
      const wgetCommand = this._buildWgetCommand(url, targetDir);
      
      console.log(`⚙️ Komut: ${wgetCommand}`);
      
      // wget'i çalıştır
      try {
        execFileSync('wget', ['--mirror', '--convert-links', '--adjust-extension', '--page-requisites', '--no-parent', url, '-P', targetDir], { 
          stdio: 'inherit',
          timeout: 300000 // 5 dakika timeout
        });
      } catch (execError) {
        // wget bulunamadıysa httrack dene
        if (execError.message.includes('wget') || execError.message.includes('not found')) {
          console.log('⚠️ wget bulunamadı, httrack deneniyor...');
          const httrackCommand = this._buildHttrackCommand(url, targetDir);
          console.log(`⚙️ Komut: ${httrackCommand}`);
          execFileSync('httrack', [url, '-O', targetDir, '+*.framer.ai/*', '-v'], { 
            stdio: 'inherit',
            timeout: 300000
          });
        } else {
          throw execError;
        }
      }

      // İndirilen dosyaları doğrula
      const validation = await this.validateThemeFiles(targetDir);
      
      if (!validation.valid) {
        return {
          success: false,
          message: `Tema dosyaları eksik: ${validation.missingFiles.join(', ')}`,
          files: []
        };
      }

      // İndirilen dosyaları listele
      const files = await this._listFiles(targetDir);
      
      console.log(`✅ Tema başarıyla indirildi: ${files.length} dosya`);
      
      return {
        success: true,
        message: `Tema başarıyla indirildi: ${files.length} dosya`,
        files
      };

    } catch (error) {
      console.error('❌ Tema indirme hatası:', error.message);
      return {
        success: false,
        message: `Tema indirme hatası: ${error.message}`,
        files: []
      };
    }
  }

  /**
   * İndirilen dosyaları doğrula
   * @param {string} targetDir - Kontrol edilecek klasör
   * @returns {Promise<{valid: boolean, missingFiles: string[]}>}
   */
  async validateThemeFiles(targetDir) {
    console.log(`🔍 Tema dosyaları doğrulanıyor: ${targetDir}`);

    const requiredFiles = [
      'index.html'
    ];

    const missingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(targetDir, file);
      try {
        await fs.access(filePath);
      } catch {
        missingFiles.push(file);
      }
    }

    const valid = missingFiles.length === 0;

    if (valid) {
      console.log('✅ Tema dosyaları geçerli');
    } else {
      console.log(`⚠️ Eksik dosyalar: ${missingFiles.join(', ')}`);
    }

    return {
      valid,
      missingFiles
    };
  }

  /**
   * wget komutunu oluştur
   * @private
   */
  _buildWgetCommand(url, targetDir) {
    return `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent "${url}" -P "${targetDir}"`;
  }

  /**
   * httrack komutunu oluştur
   * @private
   */
  _buildHttrackCommand(url, targetDir) {
    return `httrack "${url}" -O "${targetDir}" "+*.framer.ai/*" -v`;
  }

  /**
   * Klasördeki tüm dosyaları listele
   * @private
   */
  async _listFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await this._listFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }

    return fileList;
  }
}

module.exports = new ThemeScraperService();
