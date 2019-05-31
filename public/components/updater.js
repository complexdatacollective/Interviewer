/* eslint-disable class-methods-use-this */

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('./log');
const EventEmitter = require('events').EventEmitter;

class Updater {
  constructor() {
    this.releasesUrl = 'https://github.com/codaco/Network-Canvas/releases';
    this.events = new EventEmitter();
    autoUpdater.autoDownload = false;
    autoUpdater.on('error', this.onError);
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded);
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
  }

  onUpdateAvailable(updateInfo) {
    dialog.showMessageBox({
      type: 'question',
      title: 'Update Available',
      message: 'Do you want update now?',
      detail: `Version ${updateInfo.releaseName} is available.\n\nRelease notes are available at:\n${this.releasesUrl}\n\nClick 'Download and Restart' to fetch this update and install it. Ensure you have exported or backed up any important data before continuing.`,
      buttons: ['Download and Restart', 'Cancel'],
    },
    (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  }

  onUpdateNotAvailable() {
    if (this.notifyOnNoUpdates) {
      dialog.showMessageBox({
        title: 'No Updates Available',
        message: 'Network Canvas is up-to-date.',
      });
    } else {
      log.info('No updates available (did not notify user).');
    }
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
    dialog.showErrorBox('Error', 'There was an error checking for updates. You may need to update this app manually.');
  }

  on(...args) {
    this.events.on(...args);
  }

  checkForUpdates(notifyOnNoUpdates = true) {
    this.notifyOnNoUpdates = !!notifyOnNoUpdates;
    autoUpdater.checkForUpdates();
  }
}

module.exports = Updater;

