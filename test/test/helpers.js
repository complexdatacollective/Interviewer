import path from 'path';
import { Application } from 'spectron';
import electron from 'electron';

const pluralize = f => (...apps) => Promise.all(apps.map(app => f(app)));

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
};

export const resetApps = pluralize(resetApp);
