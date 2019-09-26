/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import { makeTestingApp, startApps, stopApps, resizeApp, matchImageSnapshot } from '../helpers';

const app = makeTestingApp('Network-Canvas');

const testSizes = [
  [1280, 800],
  [1440, 900],
];

const setup = async () => {
  await fakeDialog.apply(app);
  await startApps(app);
};

const teardown = async () => {
  await stopApps(app);
};

describe('Start screen', () => {
  beforeAll(setup);
  afterAll(teardown);

  testSizes.forEach(([width, height]) => {
    describe(`${width}x${height}`, () => {
      beforeAll(resizeApp(app, width, height));

      it('on first load it shows no protocols installed', async () => {
        await app.client.waitForVisible('h1=No interview protocols installed');
        await matchImageSnapshot(app);
        // expect(app.browserWindow.capturePage()).resolves.toMatchImageSnapshot();
      });
    });
  });
});
