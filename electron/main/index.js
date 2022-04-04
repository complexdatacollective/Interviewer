const { app, BrowserWindow, shell, Menu } = require('electron');
const { join } = require('path');
const mainMenu = require('./components/mainMenu');
const loadDevTools = require('./components/loadDevTools');
const { registerProtocol } = require('./components/registerAssetProtocol');
const { registerAppListeners, registerIPCListeners } = require('./components/listeners');

// App must only add a certificate known to be from a trusted, paired Server.
// Cert will be considered when making https calls; see the 'certificate-error' handler.
global.pretrustedCertificates = new Set();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win;

async function createWindow() {
  // Create the browser window.
  const windowParameters = {
    width: 1440,
    height: 900,
    center: true,
    minWidth: 1280,
    minHeight: 800,
    title: 'Network Canvas Interviewer',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      spellcheck: false,
      backgroundThrottling: false, // animations continue when the app isn't focused.
    },
  };

  win = new BrowserWindow(windowParameters);

  const appMenu = Menu.buildFromTemplate(mainMenu(win));
  Menu.setApplicationMenu(appMenu);

  if (app.isPackaged || process.env['DEBUG']) {
    win.loadFile(join(__dirname, '../../public/index.html'));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    // const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
    const url = `http://localhost:3000`;
    win.loadURL(url);
    win.webContents.openDevTools();
  }

  // Test active push message to Renderer-process
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow).then(() => {
  registerIPCListeners();
  registerAppListeners();
  registerProtocol();
  loadDevTools();
});
