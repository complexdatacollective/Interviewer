const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
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

  // Open any new windows in default browser (not electron)
  mainWindow.webContents.on('new-window', (evt, newUrl) => {
    evt.preventDefault();
    shell.openExternal(newUrl);
  });
}

function reopenMainWindow() {
  if (mainWindow === null) {
    createWindow();
  }
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
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' }
      ]
    },
    {
      label: 'Develop',
      submenu: [
        { role: 'toggledevtools' },
        { type: 'separator' },
        {
          label: 'Reset All Data...',
          click: () => {
            dialog.showMessageBox({
              message: 'This will reset all app data, are you sure?',
              buttons: ['OK', 'Cancel']
            }, (response) => {
              if (response === 0) {
                mainWindow.webContents.session.clearStorageData({}, () => {
                  mainWindow.loadURL(appUrl);
                });
              }
            });
          }
        }
      ]
    }
  ];
  if (isMacOS()) {
    template.push({
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        {
          label: 'Main Window',
          click: reopenMainWindow
        }
      ]
    });
  } else {
    template[0].label = 'File';
  }

  const appMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appMenu);
}

function loadDevToolsExtensions() {
  const extensions = process.env.NC_DEVTOOLS_EXENSION_PATH;
  if (process.env.NODE_ENV !== 'development' || !extensions) {
    return;
  }
  try {
    extensions.split(';').forEach(filepath => BrowserWindow.addDevToolsExtension(filepath));
  } catch (err) {
    /* eslint-disable no-console, global-require */
    const chalk = require('chalk');
    console.warn(err);
    console.warn(chalk.yellow('A Chrome dev tools extension failed to load. If the extension has upgraded, update your NC_DEVTOOLS_EXENSION_PATH:'));
    console.warn(chalk.yellow(process.env.NC_DEVTOOLS_EXENSION_PATH));
    /* eslint-enable */
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMenu();
  createWindow();
  loadDevToolsExtensions();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', reopenMainWindow);
