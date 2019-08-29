import path from 'path';
import electron from 'electron';
import fs from 'fs-extra';
import { kebabCase } from 'lodash';
import paths from '../config/paths';

// in ms
export const timing = {
  long: 1000,
  medium: 500,
  short: 250,
};

export const developmentProtocol = process.env.DEVELOPMENT_PROTOCOL ||
  'https://github.com/codaco/development-protocol/releases/download/20190529123247-7c1e58a/development-protocol.netcanvas';

export const defaultImageSnaphotConfig = {
  // { testPath, currentTestName, counter, defaultIdentifier }
  customSnapshotIdentifier: ({ testPath, currentTestName, counter }) =>
    kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}`),
};

export const getAppConfiguration = () => {
  let appBuild;
  let devServerURI;

  if (process.env.TEST_ENV === 'development') {
    appBuild = path.join(__dirname, '..', 'public');
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

  appBuild = path.join(__dirname, '..', 'www');
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
