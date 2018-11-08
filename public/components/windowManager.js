const { BrowserWindow, Menu, shell } = require('electron');
const url = require('url');
const path = require('path');
const mainMenu = require('./mainMenu');
const log = require('./log');

const isMacOS = () => process.platform === 'darwin';

const titlebarParameters = isMacOS() ? { titleBarStyle: 'hidden', frame: false } : {};

let window;

const appUrl = (function getAppUrl() {
  if (process.env.NODE_ENV === 'development' && process.env.NC_DEVSERVER_FILE) {
    // This method is more robust than Architect & Server to support multiple platforms & devices
    // NC_DEVSERVER_FILE contains the URL of a running webpack-dev-server, relative to app root
    try {
      const relativePath = path.join(__dirname, '..', '..', process.env.NC_DEVSERVER_FILE);
      return require('fs').readFileSync(relativePath, 'utf-8'); // eslint-disable-line global-require
    } catch (err) {
      log.warn('Error loading dev server config -', err.message);
      log.warn('Are you running dev server?');
      log.warn('Continuing with index.html');
    }
  }
  return url.format({
    pathname: path.join(__dirname, '..', 'index.html'),
    protocol: 'file:'
  });
}());

function setApplicationMenu(appWindow) {
  const appMenu = Menu.buildFromTemplate(mainMenu(appWindow));
  Menu.setApplicationMenu(appMenu);
}

function loadApp(appWindow, cb) {
  appWindow.webContents.on('did-finish-load', cb);

  appWindow.loadURL(appUrl);
}

function createWindow() {
  if (window) { return Promise.resolve(window); }

  return new Promise((resolve) => {
    // Create the browser window.
    const windowParameters = Object.assign({
      width: 1440,
      height: 900,
      minWidth: 1280,
      minHeight: 800,
      center: true,
      title: 'Network Canvas',

    }, titlebarParameters);

    const mainWindow = new BrowserWindow(windowParameters);

    // Open any new windows in default browser (not electron)
    // NOTE: This differs from Architect, which does not support opening links
    mainWindow.webContents.on('new-window', (evt, newUrl) => {
      evt.preventDefault();
      shell.openExternal(newUrl);
    });

    // For now, any navigation off the SPA is unneeded
    mainWindow.webContents.on('will-navigate', (evt) => {
      evt.preventDefault();
    });

    if (process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools();
    }

    window = mainWindow;

    window.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      window = null;
    });

    setApplicationMenu(window);

    loadApp(window, () => resolve(window));
  });
}

const windowManager = {
  get hasWindow() { return !!window; },
  getWindow: function getWindow() {
    return createWindow();
  },
};

module.exports = windowManager;
