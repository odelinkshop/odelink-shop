const electronInstaller = require('electron-winstaller');
const path = require('path');

async function build() {
  try {
    console.log('🚀 Kurulum sihirbazı (Ödelink Setup) oluşturuluyor... Bu işlem bilgisayar hızına göre 1-2 dakika sürebilir.');
    
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist', 'Odelink-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist_installer'),
      authors: 'Ödelink Team',
      exe: 'Odelink.exe',
      title: 'Ödelink',
      setupIcon: path.join(__dirname, 'icon.ico'),
      iconUrl: 'https://odelink.shop/favicon.ico',
      setupExe: 'Odelink-Setup-Windows.exe',
      noMsi: true,
      description: 'Ödelink Yönetim Paneli - İşletmenizi her an, her yerden yönetin.'
    });
    
    console.log('🎉 Kurulum Sihirbazı başarıyla oluşturuldu! (Odelink-Setup-Windows.exe)');
  } catch (e) {
    console.log(`❌ Sihirbaz Oluşturma Hatası: ${e.message}`);
  }
}

build();
