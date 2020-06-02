/* eslint-env jest */

import dialogAddon from 'spectron-dialog-addon';
import { timing } from '../config';
import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
  matchImageSnapshot,
} from './helpers';
import {
  loadProtocolFromNetwork,
  loadMockProtocolAsFile,
  loadMockProtocolAsFileAgain,
} from './playbook';

const app = makeTestingApp('Network-Canvas');

const setup = async () => {
  await dialogAddon.apply(app);
  await startApps(app);
};

const teardown = async () => {
  await stopApps(app);
};

describe('Start screen', () => {
  beforeAll(setup);
  afterAll(teardown);

  // it.only('does nothing', async () => {
  //   await app.client.pause(10000);
  // });

  it('on first load it shows no protocols installed', async () => {
    await app.client.waitForVisible('h1=No interview protocols installed');
    await app.client.pause(timing.medium);
    await matchImageSnapshot(app);
  });

  it('loads a protocol from disk', async () => {
    await loadMockProtocolAsFile(app);
    await matchImageSnapshot(app);
  });

  it('communicates when protocol already loaded', async () => {
    await loadMockProtocolAsFileAgain(app);
  });

  it('lists loaded protocols, and allows delete', async () => {
    await app.client.waitForVisible('[data-clickable="start-interview"]');
    await app.client.click('.protocol-card__delete');
    await app.client.pause(timing.medium);
    await app.client.click('button=Delete protocol');
    await app.client.waitForVisible('h1=No interview protocols installed');
  });

  it('can load a protocol from url', async () => {
    await loadProtocolFromNetwork(app);
    await matchImageSnapshot(app);
  });

  it('can reset state', async () => {
    await app.client.click('svg[name=settings]');
    await app.client.pause(timing.medium);
    await app.client.waitForVisible('li[data-name="Developer Options"]');
    await app.client.moveToObject('li[data-name="Developer Options"]');
    await forceClick(app, 'li[data-name="Developer Options"]');
    await app.client.pause(timing.short);
    await app.client.waitForVisible('#reset-all-nc-data');
    await app.client.moveToObject('#reset-all-nc-data');
    await forceClick(app, '#reset-all-nc-data');
    await app.client.pause(timing.medium);
    await app.client.click('button=Continue');
    await app.client.waitForVisible('h1=No interview protocols installed');
    await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
  });
});
