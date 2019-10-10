/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import { makeTestingApp, startApps, stopApps, resizeApp, matchImageSnapshot } from '../helpers';
import { timing } from '../../config';
import { loadEmptyProtocol, loadDevelopmentProtocol } from '../playbook';

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
    describe(`${width}x${height}`, async () => {
      beforeAll(resizeApp(app, width, height));

      it('no protocols installed', async () => {
        await app.client.waitForVisible('h1=No interview protocols installed');
        await app.client.pause(timing.medium);
        await matchImageSnapshot(app);
      });

      it('with protocols installed', async () => {
        await loadEmptyProtocol(app);
        await matchImageSnapshot(app);
      });

      it('development protocol', async () => {
        await loadDevelopmentProtocol(app);
        await matchImageSnapshot(app);
      });
      //   beforeAll(async () => {

      //   });

      //   afterEach(async () => {
      //     await app.client.debug();
      //   });


      // });
    });
  });
});
