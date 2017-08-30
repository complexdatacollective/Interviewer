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
const log = require('electron-log');

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
  autoUpdater.downloadUpdate().catch(
    // Error checking for updates
    (error) => {
      sendToRenderer('ERROR', error);
    });
});

ipcMain.on('INSTALL_UPDATE', () => {
  setImmediate(() => autoUpdater.quitAndInstall());
});

autoUpdater.autoDownload = false;

autoUpdater.on('error', (event, error) => {
  sendToRenderer('ERROR', error);
});

autoUpdater.on('update-available', () => {
  sendToRenderer('UPDATE_AVAILABLE', 'UPDATE_AVAILABLE');
});


autoUpdater.on('update-not-available', () => {
  sendToRenderer('UPDATE_NOT_AVAILABLE', 'UPDATE_NOT_AVAILABLE');
});

autoUpdater.on('update-downloaded', () => {
  sendToRenderer('UPDATE_DOWNLOADED', 'UPDATE_DOWNLOADED');
});
