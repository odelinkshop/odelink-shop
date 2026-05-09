const { app, BrowserWindow, Notification, Tray, Menu } = require('electron');
const path = require('path');

let mainWindow;
let tray;

// Single Instance Lock - Uygulamanın sadece 1 kere açılmasını sağlar
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1024,
      minHeight: 768,
      title: 'Odelink Command Center',
      backgroundColor: '#050505',
      icon: path.join(__dirname, 'icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    mainWindow.loadURL('https://www.odelink.shop/panel');

    // Menü çubuğunu gizle (Profesyonel görünüm)
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
      return false;
    });
  }

  function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Paneli Aç', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: 'Çıkış', click: () => {
        app.isQuitting = true;
        app.quit();
      }}
    ]);
    tray.setToolTip('Odelink Live Control');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow.show());
  }

  app.whenReady().then(() => {
    createWindow();
    createTray();

    new Notification({
      title: 'Odelink Aktif',
      body: 'Siber Karargah başarıyla başlatıldı.',
      icon: path.join(__dirname, 'icon.png')
    }).show();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
