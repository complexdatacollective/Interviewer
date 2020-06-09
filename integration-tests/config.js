const path = require('path');
const electron = require('electron');
const fs = require('fs-extra');
const { kebabCase } = require('lodash');
const appPaths = require('../config/paths');
const { DEVELOPMENT_PROTOCOL_URL } = require('../src/config');

// in ms
const timing = {
  long: 3000,
  medium: 1500,
  short: 500,
};

const testSizes = {
  default: [1280, 800],
  wide: [1440, 900],
};

const paths = {
  dataDir: path.join(__dirname, '.data'),
};

const developmentProtocol = process.env.DEVELOPMENT_PROTOCOL_URL || DEVELOPMENT_PROTOCOL_URL;

const mockProtocol = 'https://raw.githubusercontent.com/codaco/Network-Canvas/master/integration-tests/data/mock.netcanvas';

const defaultImageSnaphotConfig = {
  // { testPath, currentTestName, counter, defaultIdentifier }
  customSnapshotIdentifier: ({ testPath, currentTestName, counter }) =>
    kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}`),
  customDiffConfig: { threshold: 0.25 },
  blur: 1,
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
};

const getAppConfiguration = () => {
  let appBuild;
  let devServerURI;

  if (process.env.TEST_ENV === 'development') {
    appBuild = path.join(__dirname, '..', 'public');
    devServerURI = fs.readFileSync(appPaths.dotdevserver, 'utf-8');

    return {
      path: electron,
      waitTimeout: 20000, // Timeout for waitUntil* methods
      webdriverOptions: {
        baseUrl: devServerURI,
        deprecationWarnings: false,
      },
      chromeDriverArgs: ['no-sandbox'],
      chromeDriverLogPath: path.join(__dirname, '..', 'chromedriver.log'),
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
    chromeDriverArgs: ['no-sandbox', 'headless', 'disable-dev-shm-usage'],
    waitTimeout: 20000, // Timeout for waitUntil* methods
    webdriverOptions: {
      baseUrl: devServerURI,
      deprecationWarnings: false,
    },
    env: {
      TEST: 'test',
    },
    args: [appBuild],
  };
};

module.exports = {
  timing,
  testSizes,
  developmentProtocol,
  mockProtocol,
  defaultImageSnaphotConfig,
  getAppConfiguration,
  paths,
};
