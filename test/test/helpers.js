import path from 'path';
import { Application } from 'spectron';
import electron from 'electron';

export const makeTestingApp = () => {
  const appBuild = path.join(__dirname, '../', '../', 'public');
  const appConfig = {
    path: electron,
    env: {
      NODE_ENV: 'test',
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

export const startApps = (...apps) => Promise.all(apps.map(app => startApp(app)));

export const stopApp = async (app) => {
  if (app && app.isRunning()) {
    return app.stop().catch(() => {});
  }
  return Promise.resolve();
};

export const stopApps = (...apps) => Promise.all(apps.map(app => stopApp(app)));
