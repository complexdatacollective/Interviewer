import path from 'path';
import { Application } from 'spectron';
import electron from 'electron';

const pluralize = f => (...apps) => Promise.all(apps.map(app => f(app)));

// in ms
export const timing = {
  medium: 500,
  short: 250,
};

export const makeTestingApp = () => {
  // const electronPath = getElectronBinaryPath(appName);
  const appBuild = path.join(__dirname, '../', '../', 'public');
  const appConfig = {
    path: electron,
    env: {
      // NODE_ENV: 'test',
      TEST: 'test',
      NC_DEVSERVER_FILE: '.devserver',
    },
    args: [appBuild],
  };
  return new Application(appConfig);
};

export const startApp = async (app) => {
  await app.start();
  await app.client.waitUntilWindowLoaded();
  return app;
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
  await app.client.pause(500);
};

export const resetApps = pluralize(resetApp);

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
