/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please
 * use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates`
 *    callback from `updater` for the click property of `Check Updates...` MenuItem.
 */

const { autoUpdater } = require('electron-updater');
const { ipcMain, BrowserWindow } = require('electron');

function sendToRenderer(channel, message) {
  const arr = BrowserWindow.getAllWindows();
  for (let i = 0; i < arr.length; i += 1) {
    const toWindow = arr[i];
    toWindow.webContents.send(channel, message);
  }
}

ipcMain.on('CHECK_FOR_UPDATE', () => {
  autoUpdater.checkForUpdates();
});

ipcMain.on('DOWNLOAD_UPDATE', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('INSTALL_UPDATE', () => {
  setImmediate(() => autoUpdater.quitAndInstall());
});

autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  sendToRenderer('ERROR', error.message);
});

autoUpdater.on('update-available', (info) => {
  sendToRenderer('UPDATE_AVAILABLE', info);
});


autoUpdater.on('update-not-available', (info) => {
  sendToRenderer('UPDATE_NOT_AVAILABLE', info);
});

autoUpdater.on('update-downloaded', (info) => {
  sendToRenderer('UPDATE_DOWNLOADED', info);
});
