/* eslint-disable class-methods-use-this */
const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const windowManager = require('./windowManager');
const log = require('./log');

class Updater {
  constructor() {
    this.setup();

    setTimeout(() => {
      windowManager.getWindow().then(window => window.webContents.send('UPDATE_AVAILABLE'));
    }, 8000);

    setTimeout(() => {
      windowManager.getWindow().then(window => window.webContents.send('UPDATE_PENDING'));
    }, 5000);

    setTimeout(() => {
      windowManager.getWindow().then(window => window.webContents.send('UPDATE_ERROR', 'thingy'));
    }, 2000);
  }

  setup() {
    ipcMain.on('check-for-updates', this.checkForUpdates);
    ipcMain.on('download-update', this.onDownloadUpdate);

    autoUpdater.on('error', this.onError);
    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
  }

  onUpdateAvailable(updateInfo) {
    log.info('onUpdateAvailable', updateInfo);
    windowManager.getWindow().then(window => window.webContents.send('UPDATE_AVAILABLE'));
  }

  onDownloadUpdate() {
    log.info('onDownloadUpdate.');
    autoUpdater.downloadUpdate();
  }

  onUpdateNotAvailable() {
    log.info('No updates available.');
    windowManager.getWindow().then(window => window.webContents.send('UPDATE_UNAVAILABLE'));
  }

  onUpdateDownloaded() {
    log.info('Update pending.');
    windowManager.getWindow().then(window => window.webContents.send('UPDATE_PENDING'));
  }

  onError(error) {
    const detail = error ? (error.stack || error).toString() : 'An unknown error occurred';

    log.error(detail);
    windowManager.getWindow().then(window => window.webContents.send('UPDATE_ERROR', detail));
  }

  checkForUpdates() {
    log.info('checkForUpdates');
    autoUpdater.checkForUpdates();
  }
}

const getUpdater = () => {
  if (!global.updater) {
    global.updater = new Updater();
  }

  return global.updater;
};

module.exports = getUpdater;

