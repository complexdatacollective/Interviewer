/* eslint-env jest */

import { Application } from 'spectron';
import dialogAddon from 'spectron-dialog-addon';
import path from 'path';
import { kebabCase, get } from 'lodash';
import { getAppConfiguration, defaultImageSnaphotConfig, timing, testSizes } from '../config';

let appSize = 'not-set';
let _app; // eslint-disable-line

export const resetApp = async (app) => {
  await app.client.url('#/reset');
  await app.client.pause(timing.long);
};

export const resizeApp = async (app, size = 'wide') => {
  const dimensions = get(testSizes, size);
  if (!dimensions) { return; }
  console.info(`resize to: ${dimensions[0]}x${dimensions[1]}`);
  appSize = `${dimensions[0]}x${dimensions[1]}`;
  await app.browserWindow.setSize(dimensions[0], dimensions[1]);
  await resetApp(app);
};

export const makeTestingApp = async () => {
  if (_app) {
    // await _app.client.reloadSession();
    return _app;
  }
  const appConfiguration = getAppConfiguration();
  _app = new Application(appConfiguration);
  dialogAddon.apply(_app);
  await _app.start();
  await _app.client.waitUntilWindowLoaded();
  await _app.client.pause(timing.medium);
  await resizeApp(_app);
  return _app;
};

export const stopApp = async () => {
  if (_app && _app.isRunning()) {
    return _app.stop().catch(() => {});
  }
  return Promise.resolve();
};

/**
 * Clicks on element using dom apis.
 *
 * Useful when websocketio refuses to click on an element
 * that it considers 'unclickable'.
 *
 * @param {object} app Spectron app object
 * @param {string} _selector querySelector
 */
export const forceClick = async (app, _selector) => {
  await app.client.waitForVisible(_selector);
  await app.client.execute((selector) => {
    window.document.querySelector(selector).click();
  }, _selector);
};

const getImageSnaphotConfig = async app =>
  app.client.execute(() => window.devicePixelRatio)
    .then(({ value: devicePixelRatio }) => ({
      ...defaultImageSnaphotConfig,
      customSnapshotIdentifier: ({ testPath, currentTestName, counter }) =>
        `${devicePixelRatio}x-${appSize}-`
          .concat(kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}`)),
    }));

export const matchImageSnapshot = async (app, rect = null) => {
  if (process.env.TEST_ENV === 'development') {
    await app.client.pause(timing.medium);
    return;
  }

  await app.client.pause(timing.long);
  await getImageSnaphotConfig(app)
    .then(imageSnaphotConfig =>
      expect(app.browserWindow.capturePage(rect))
        .resolves.toMatchImageSnapshot(imageSnaphotConfig),
    );
};

export const pause = async (app, duration = 'medium') => {
  const time = get(timing, duration, duration);
  await app.client.pause(time);
};

export const debug = async (app) => {
  await app.browserWindow.openDevTools({ mode: 'detach' });
  await app.client.debug();
};

export const asyncForEach = async (array, callback) => {
  if (array.length === 0) {
    return null;
  }

  const item = array.shift();
  await callback(item);
  return asyncForEach(array, callback);
};
