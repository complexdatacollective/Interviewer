const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('./log');

const releasesUrl = 'https://github.com/codaco/Network-Canvas/releases';

const onUpdateAvailable = (updateInfo) => {
  dialog.showMessageBox({
    type: 'question',
    title: 'Update Available',
    message: 'Do you want update now?',
    detail: `Version ${updateInfo.releaseName} is available.\n\nRelease notes are available:\n${releasesUrl}`,
    buttons: ['Update and Restart', 'Cancel'],
  },
  (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }
  });
};

const onUpdateNotAvailable = () => {
  dialog.showMessageBox({
    title: 'No Updates Available',
    message: 'Network Canvas is up-to-date.',
  });
};

const onUpdateDownloaded = () => {
  dialog.showMessageBox({
    title: 'Install Update',
    message: 'Download Complete',
    detail: 'Your update is ready to install. Click this notification to restart the app and install the update.',
    buttons: ['Restart'],
  },
  () => setImmediate(() => autoUpdater.quitAndInstall()));
};

const onError = (error) => {
  const detail = error ? (error.stack || error).toString() : 'An unknown error occurred';
  log.error(detail);
  dialog.showErrorBox('Error', 'There was an error checking for updates. You may need to update this app manually.');
};

autoUpdater.autoDownload = false;
autoUpdater.on('error', onError);
autoUpdater.on('update-available', onUpdateAvailable);
autoUpdater.on('update-downloaded', onUpdateDownloaded);
autoUpdater.on('update-not-available', onUpdateNotAvailable);

module.exports = autoUpdater;
