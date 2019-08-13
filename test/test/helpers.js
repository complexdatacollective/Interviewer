import path from 'path';
import { Application } from 'spectron';
import electron from 'electron';

// Each app may depend on different electron versions, so we require from
// their respective node_modules.
// `require('electron')` returns the path to the binary.
// eslint-disable-next-line global-require, import/no-dynamic-require
// const getElectronBinaryPath = () => require(path.join(__dirname, 'node_modules', 'electron'));

export const makeTestingApp = () => {
  // const electronPath = getElectronBinaryPath(appName);
  const appBuild = path.join(__dirname, '../', '../', 'www');
  const appConfig = {
    path: electron,
    args: [appBuild],
  };
  return new Application(appConfig);
};

export const startApp = async (app) => {
  await app.start();
  await app.browserWindow.isVisible();
  return app;
};

export const startApps = (...apps) => Promise.all(apps.map(app => startApp(app)));

export const stopApp = async (app) => {
  if (app && app.isRunning()) {
    return app.stop().catch(() => {});
  }
  return Promise.resolve();
};

export const stopApps = (...apps) => Promise.all(apps.map(app => stopApp(app)));
