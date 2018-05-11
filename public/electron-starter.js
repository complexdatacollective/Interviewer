const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const registerAssetsProtocol = require('./components/assetsProtocol').registerAssetsProtocol;
require('./components/updater');

const isMacOS = () => os.platform() === 'darwin';

const titlebarParameters = isMacOS() ? { titleBarStyle: 'hidden', frame: false } : {};

const windowParameters = Object.assign({
  width: 1440,
  height: 900,
  minWidth: 1280,
  minHeight: 800,
  center: true,
  title: 'Network Canvas'

}, titlebarParameters);

log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const appUrl = (function getAppUrl() {
  if (process.env.NODE_ENV === 'development' && process.env.NC_DEVSERVER_FILE) {
    // NC_DEVSERVER_FILE contains the URL of a running webpack-dev-server, relative to app root
    try {
      const relativePath = path.join(__dirname, '..', process.env.NC_DEVSERVER_FILE);
      return fs.readFileSync(relativePath, 'utf-8');
    } catch (err) {
      log.warn('Error loading dev server config -', err.message);
      log.warn('Are you running dev server?');
      log.warn('Continuing with index.html');
    }
  }
  return url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:'
  });
}());

function createWindow() {
  registerAssetsProtocol();

  // Create the browser window.
  mainWindow = new BrowserWindow(windowParameters);
  mainWindow.loadURL(appUrl);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' }
      ]
    }
  ];
  if (!isMacOS()) {
    template[0].label = 'File';
  }

  const appMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMenu();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
