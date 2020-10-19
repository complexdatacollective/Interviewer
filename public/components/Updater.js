/* eslint-disable class-methods-use-this */

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('./log');

global.silentUpdates = false;

const releasesUrl = 'https://github.com/complexdatacollective/Network-Canvas/releases';

class Updater {
  constructor() {
    this.setup();
  }

  setup() {
    autoUpdater.autoDownload = false;
    autoUpdater.on('error', this.onError);
    autoUpdater.on('update-available', this.onUpdateAvailable);
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable);
  }

  onUpdateAvailable(updateInfo) {
    dialog.showMessageBox({
      type: 'question',
      title: 'Update Available',
      message: 'Do you want update now?',
      detail: `Version ${updateInfo.releaseName} is available.\n\nRelease notes are available at:\n${releasesUrl}\n\nClick 'Download and Restart' to fetch this update and install it. Ensure you have exported or backed up any important data before continuing.`,
      buttons: ['Download and Restart', 'Cancel'],
    })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  }

  onUpdateNotAvailable() {
    if (global.silentUpdates) {
      log.info('No updates available (did not notify user).');
      return;
    }

    dialog.showMessageBox({
      title: 'No Updates Available',
      message: 'Network Canvas is up-to-date.',
    });
  }

  onUpdateDownloaded() {
    dialog.showMessageBox({
      title: 'Install Update',
      message: 'Download Complete',
      detail: 'Your update is ready to install. You must now restart the app and install the update.',
      buttons: ['Restart'],
    },
    () => setImmediate(() => autoUpdater.quitAndInstall()));
  }

  onError(error) {
    const detail = error ? (error.stack || error).toString() : 'An unknown error occurred';

    log.error(detail);

    if (global.silentUpdates) {
      log.info('Update Error (Did not notify user)');
      return;
    }

    dialog.showMessageBox({
      title: 'Error',
      message: 'Download Complete',
      detail: 'There was an error checking for updates. You may need to update this app manually.',
      buttons: ['Okay'],
    });
  }

  checkForUpdates(silent = false) {
    global.silentUpdates = !!silent;

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

