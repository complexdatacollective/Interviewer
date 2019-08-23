/* eslint-env jest */

import path from 'path';
import fakeDialog from 'spectron-fake-dialog';
import { makeTestingApp, startApps, stopApps, forceClick, timing } from './helpers';
import { dataDir } from '../paths';

let app;

const setup = async () => {
  app = makeTestingApp('Network-Canvas');
  await fakeDialog.apply(app);
  await startApps(app);
  await app.client.pause(timing.medium);
  // TODO: enforce window size once API is high enough to support it
  // It should already work with v4 (albeit with a different syntax to below) but doesn't seem to
  // be supported
  // await app.client.setWindowSize(1280, 800);
};

const teardown = async () => {
  // Uncomment to investigate inspector
  // await app.client.debug();

  await stopApps(app);
};

const reset = async () => {
  await app.client.url('#/reset');
};

describe('Start screen', () => {
  beforeAll(setup);
  afterAll(teardown);
  beforeEach(reset);

  it('on first load it shows no protocols installed', async () => {
    await app.client.waitForVisible('h1=No interview protocols installed');

    await app.client.pause(timing.medium);
    await expect(app.browserWindow.capturePage()).resolves.toMatchImageSnapshot();
  });

  it('can load a protocol from disk', async () => {
    const mockProtocolPath = path.join(dataDir, 'mock.netcanvas');
    const mockFilenames = [mockProtocolPath];

    await fakeDialog.mock([{ method: 'showOpenDialog', value: mockFilenames }]);
    await app.client.isVisible('.getting-started');
    await app.client.click('[name=add-a-protocol]');
    await app.client.waitForVisible('.protocol-import-dialog__tabs');
    await app.client.click('.tab=Local file');
    await app.client.waitForVisible('h4=Protocol imported successfully!');
    await app.client.click('button=Continue');
    await app.client.pause(timing.medium);
    await app.client.click('button.overlay__close');
    await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
  });

  it('can reset state', async () => {
    await app.client.click('svg[name=settings]');
    await app.client.pause(timing.medium);

    await app.client.waitForVisible('#reset-all-nc-data');
    await app.client.moveToObject('#reset-all-nc-data'); // for added realism, as we click using dom
    await forceClick(app, '#reset-all-nc-data');
    await app.client.pause(timing.medium);
    await app.client.click('button=Continue');
    await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
  });
});
