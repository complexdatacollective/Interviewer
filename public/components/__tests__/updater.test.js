/* eslint-env jest */

const { dialog } = require('electron');
const updater = require('../updater');

jest.mock('electron');
jest.mock('fs');
jest.mock('electron-updater');

describe('updater', () => {
  beforeEach(() => {
    dialog.showMessageBox.mockClear();
  });

  it('provides an update hook', async () => {
    await expect(updater.checkForUpdates()).resolves.toEqual(expect.anything());
  });

  it('does not download automatically', () => {
    expect(updater.autoDownload).toBe(false);
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
    updater.simulate('update-not-available', {});
    expect(dialog.showMessageBox).toHaveBeenCalled();
  });
});
