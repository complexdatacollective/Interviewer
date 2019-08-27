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

export const developmentProtocol = process.env.DEVELOPMENT_PROTOCOL ||
  'https://github.com/codaco/development-protocol/releases/download/20190529123247-7c1e58a/development-protocol.netcanvas';

const pluralize = f => (...apps) => Promise.all(apps.map(app => f(app)));

const getAppConfiguration = () => {
  let appBuild;
  let devServerURI;

  if (process.env.TEST_ENV === 'development') {
    appBuild = path.join(__dirname, '../', '../', 'public');
    devServerURI = fs.readFileSync(paths.dotdevserver, 'utf-8');

    return {
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
  }

  appBuild = path.join(__dirname, '..', '..', 'www');
  devServerURI = `file:///${path.join(appBuild, 'index.html')}`;

  return {
    path: electron,
    webdriverOptions: {
      baseUrl: devServerURI,
    },
    env: {
      TEST: 'test',
    },
    args: [appBuild],
  };
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

/**
 * For reuse when testing interfaces
 */
export const loadDevelopmentProtocol = async (app) => {
  await app.client.isVisible('.getting-started');
  await app.client.click('[name=add-a-protocol]');
  await app.client.waitForVisible('.protocol-import-dialog__tabs');
  await app.client.click('.tab=From URL');
  await app.client.$('input[name=protocol_url]').setValue(developmentProtocol);
  await app.client.click('button=Import');
  await app.client.waitForVisible('h4=Protocol imported successfully!', 600000); // 10mins
  await app.client.click('button=Continue');
  await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
};

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
