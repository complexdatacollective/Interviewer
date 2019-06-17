/* eslint-env jest */

const EventEmitter = require('events').EventEmitter;

const autoUpdater = new EventEmitter();
autoUpdater.autoDownload = true;
autoUpdater.checkForUpdates = jest.fn();
autoUpdater.downloadUpdate = jest.fn();
autoUpdater.quitAndInstall = jest.fn();

module.exports = { autoUpdater };
