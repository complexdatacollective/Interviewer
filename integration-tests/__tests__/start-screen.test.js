/* eslint-env jest */

import { timing, mockProtocol } from '../config';
import {
  makeTestingApp,
  forceClick,
  matchImageSnapshot,
} from './helpers';
import {
  loadMockProtocolAsFile,
  loadMockProtocolAsFileAgain,
} from './playbook';

let app;

const setup = async () => {
  app = await makeTestingApp('Network-Canvas');
};

beforeAll(setup);

describe('Start screen', () => {
  beforeEach(() => {
    app.client.url('#/reset');
    app.client.pause(timing.long);
  });

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
    await loadMockProtocolAsFile(app);
    await loadMockProtocolAsFileAgain(app);
    await matchImageSnapshot(app);
  });

  it('lists loaded protocols, and allows delete', async () => {
    await matchImageSnapshot(app);
    await loadMockProtocolAsFile(app);
    await app.client.waitForVisible('[data-clickable="start-interview"]');
    await app.client.click('.protocol-card__delete');
    await app.client.pause(timing.medium);
    await app.client.click('button=Delete protocol');
    await app.client.waitForVisible('h1=No interview protocols installed');
    await matchImageSnapshot(app);
  });

  it('can load a protocol from url', async () => {
    await matchImageSnapshot(app);
    await app.client.isVisible('.getting-started');
    await app.client.click('[name=add-a-protocol]');
    await app.client.waitForVisible('.protocol-import-dialog__tabs');
    await app.client.click('.tab=From URL');
    await matchImageSnapshot(app);
    await app.client.waitForVisible('input[name=protocol_url]');
    await app.client.setValue('input[name=protocol_url]', mockProtocol);
    await app.client.click('button=Import');
    await app.client.waitForVisible('h4=Protocol imported successfully!', 120000); // 2 minutes
    await app.client.click('button=Continue');
    await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
    await matchImageSnapshot(app);
  });

  it('can reset state', async () => {
    await matchImageSnapshot(app);
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
    // await app.client.waitForExist('.modal', timing.long, true); // wait for not exist
    await matchImageSnapshot(app);
  });
});
