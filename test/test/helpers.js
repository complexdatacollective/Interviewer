/* eslint-env jest */

import path from 'path';
import { Application } from 'spectron';
import electron from 'electron';
import fs from 'fs-extra';
import paths from '../../config/paths';

// in ms
export const timing = {
  long: 1000,
  medium: 500,
  short: 250,
};

const devServerURI = fs.readFileSync(paths.dotdevserver, 'utf-8');

const pluralize = f => (...apps) => Promise.all(apps.map(app => f(app)));

const getAppConfiguration = () => {
  const appBuild = path.join(__dirname, '../', '../', 'public');

  const appConfiguration = {
    path: electron,
    webdriverOptions: {
      baseUrl: devServerURI,
    },
    env: {
      TEST: 'test',
      NC_DEVSERVER_FILE: '.devserver',
    },
    args: [appBuild],
  };

  return appConfiguration;
};

export const makeTestingApp = () => {
  const appConfiguration = getAppConfiguration();
  return new Application(appConfiguration);
};

export const startApp = async (app) => {
  await app.start();
  await app.client.waitUntilWindowLoaded();
  await app.client.pause(timing.medium);
};

export const startApps = pluralize(startApp);

export const stopApp = async (app) => {
  if (app && app.isRunning()) {
    return app.stop().catch(() => {});
  }
  return Promise.resolve();
};

export const stopApps = pluralize(stopApp);

export const resetApp = async (app) => {
  await app.client.execute(() => {
    window.localStorage.clear();
  });
  await app.webContents.reload();
  await app.client.waitUntilWindowLoaded();
  await app.client.pause(timing.medium);
};

export const resetApps = pluralize(resetApp);

export const resizeApp = (_app, width, height) =>
  async () => {
    await _app.browserWindow.setSize(width, height);
    await _app.client.url('#/reset');
    await _app.client.pause(timing.medium); // wait for assets/fonts to load
  };

/**
 * Clicks on element using dom apis.
 *
 * Useful when websocketio refuses to click on an element
 * that it considers 'unclickable'.
 *
 * @param {object} _app Spectron app object
 * @param {string} _selector querySelector
 */
export const forceClick = async (_app, _selector) => {
  await _app.client.waitForVisible(_selector);
  await _app.client.execute((selector) => {
    window.document.querySelector(selector).click();
  }, _selector);
};
