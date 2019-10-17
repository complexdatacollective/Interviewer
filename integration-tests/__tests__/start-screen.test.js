/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import { timing } from '../config';
import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
  matchImageSnapshot,
} from './helpers';
import { loadProtocolFromFile, loadProtocolFromNetwork } from './playbook';

const app = makeTestingApp('Network-Canvas');

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

  it('on first load it shows no protocols installed', async () => {
    await app.client.waitForVisible('h1=No interview protocols installed');
    await app.client.pause(timing.medium);
    await matchImageSnapshot(app);
  });

  it('loads a protocol from disk', async () => {
    await loadProtocolFromFile(app);
    await matchImageSnapshot(app);
  });

  it('lists loaded protocols, and allows delete', async () => {
    await loadProtocolFromFile(app);
    await app.client.waitForVisible('h2=mock');
    await app.client.click('.protocol-card__delete');
    await app.client.pause(timing.medium);
    await app.client.click('button=Delete protocol');
    await app.client.waitForVisible('h1=No interview protocols installed');
  });

  it('can load a protocol from url', async () => {
    await loadProtocolFromNetwork(app);
  });

  it('can reset state', async () => {
    await app.client.click('svg[name=settings]');
    await app.client.pause(timing.medium);
    await app.client.waitForVisible('#reset-all-nc-data');
    await app.client.moveToObject('#reset-all-nc-data'); // for added realism, as we click using dom
    await forceClick(app, '#reset-all-nc-data');
    await app.client.pause(timing.medium);
    await app.client.click('button=Continue');
    // await app.client.waitForVisible('h1=No interview protocols installed');
    // await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
  });
});
