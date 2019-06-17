/* eslint-env jest */
const Updater = require('../Updater');
const { dialog } = require('electron');

jest.mock('electron');
jest.mock('electron-updater');
jest.mock('electron-log');

let updater;

describe('updater', () => {
  beforeEach(() => {
    dialog.showMessageBox.mockClear();
    updater = new Updater(true);
  });

  it('shows a message when update available', () => {
    updater.simulate('update-available', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  it('shows a message when download ready', () => {
    updater.simulate('update-downloaded', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });

  it('shows a message when no update available', () => {
    updater.checkForUpdates();
    updater.simulate('update-not-available', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });
});
