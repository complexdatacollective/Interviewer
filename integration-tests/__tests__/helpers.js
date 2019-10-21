/* eslint-env jest */

import { Application } from 'spectron';
import path from 'path';
import { kebabCase, get } from 'lodash';
import { getAppConfiguration, defaultImageSnaphotConfig, timing, testSizes } from '../config';

const pluralize = f => (...apps) => Promise.all(apps.map(app => f(app)));

let appSize = 'not-set';

export const resizeApp = async (app, size = 'wide') => {
  const dimensions = get(testSizes, size);
  if (!dimensions) { return; }
  console.info(`resize to: ${dimensions[0]}x${dimensions[1]}`);
  appSize = `${dimensions[0]}x${dimensions[1]}`;
  await app.browserWindow.setSize(dimensions[0], dimensions[1]);
  await app.client.url('#/reset');
  await app.client.pause(timing.medium);
};

// const forEachSize = (app, sizes, tests) => {
//   sizes.forEach((size) => {
//     const [width, height] = get(testSizes, size);

//     describe(`${width}x${height}`, () => {
//       beforeAll(resizeApp(app, size));

//       tests();
//     });
//   });
// };

export const makeTestingApp = () => {
  const appConfiguration = getAppConfiguration();
  return new Application(appConfiguration);
};

export const startApp = async (app) => {
  await app.start();
  await app.client.waitUntilWindowLoaded();
  await app.client.pause(timing.medium);
  await resizeApp(app);
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

const getImageSnaphotConfig = async (app, options = {}) =>
  app.client.execute(() => window.devicePixelRatio)
    .then(({ value: devicePixelRatio }) => ({
      ...defaultImageSnaphotConfig,
      customSnapshotIdentifier: ({ testPath, currentTestName, counter }) =>
        `${devicePixelRatio}x-${appSize}-`
          .concat(kebabCase(`${path.basename(testPath)}-${currentTestName}-${counter}`)),
      ...options,
    }));

export const matchImageSnapshot = async (app, options = {}) => {
  await app.client.pause(timing.long);
  await getImageSnaphotConfig(app, options)
    .then(imageSnaphotConfig =>
      expect(app.browserWindow.capturePage())
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
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
};
