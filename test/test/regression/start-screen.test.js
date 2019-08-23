/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import { makeTestingApp, startApps, stopApps, timing } from '../helpers';

let app;

const testSizes = [
  [1280, 800],
  [1440, 900],
];

const setup = async () => {
  app = makeTestingApp('Network-Canvas');
  await fakeDialog.apply(app);
  await startApps(app);
};

const teardown = async () => {
  await stopApps(app);
};

const resize = (width, height) =>
  async () => {
    await app.browserWindow.setSize(width, height);
    await app.client.url('#/reset');
    await app.client.pause(timing.medium); // wait for assets/fonts to load
  };

describe('Start screen', () => {
  beforeAll(setup);
  afterAll(teardown);

  testSizes.forEach(([width, height]) => {
    describe(`${width}x${height}`, () => {
      beforeAll(resize(width, height));

      it('on first load it shows no protocols installed', async () => {
        await app.client.waitForVisible('h1=No interview protocols installed');
        await expect(app.browserWindow.capturePage()).resolves.toMatchImageSnapshot();
      });
    });
  });
});
