/* eslint-env jest */
const Updater = require('../Updater');
const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

jest.mock('electron');
jest.mock('electron-updater');
jest.mock('electron-log');

const updater = Updater();

describe('updater', () => {
  beforeEach(() => {
    dialog.showMessageBox.mockClear();
    updater.checkForUpdates();
  });

  it('shows a message when update available', () => {
    autoUpdater.emit('update-available', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  it('shows a message when download ready', () => {
    autoUpdater.emit('update-downloaded', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  it('shows a message when no update available', () => {
    autoUpdater.emit('update-not-available', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  it('shows errors to the user', () => {
    autoUpdater.emit('error', new Error());
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  describe('When silentUpdates is true', () => {
    it('Do not show update dialogs', () => {
      updater.checkForUpdates(true);
      autoUpdater.emit('update-not-available', {});
      autoUpdater.emit('error', new Error());
      expect(dialog.showMessageBox).not.toHaveBeenCalled();
    });
  });
});
