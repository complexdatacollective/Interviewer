/* eslint-env jest */

import path from 'path';
import dialogAddon from 'spectron-dialog-addon';
import { timing, paths, mockProtocol, developmentProtocol } from '../config';
import getData from '../getData';
import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
  matchImageSnapshot,
} from './helpers';
import {
  startInterview,
  goToStage,
} from './playbook';
import {
  loadDevelopmentProtocol,
} from './playbook-development-protocol';

let app;

const setup = async () => {
  app = await makeTestingApp('Network-Canvas');
};

beforeAll(setup);

const setupTest = async () => {
};

describe('Name generator', () => {
  // beforeAll(setupApp);
  // beforeAll(setupTest);
  // afterAll(teardownApp);

  it.only('Can create a node', async () => {
    await app.client.url('#/reset');
    await app.client.waitUntilWindowLoaded();
    await matchImageSnapshot(app);
    // await loadDevelopmentProtocol(app);
    const [, filename] = await getData(developmentProtocol);
    const mockProtocolPath = path.join(paths.dataDir, filename);
    const mockFilenames = [mockProtocolPath];
    dialogAddon.mock([{ method: 'showOpenDialog', value: { canceled: false, filePaths: mockFilenames } }]);
    await app.client.isVisible('.getting-started');
    await app.client.click('[name=add-a-protocol]');
    await app.client.waitForVisible('.protocol-import-dialog__tabs');
    await app.client.pause(timing.short);
    await matchImageSnapshot(app);
    await app.client.click('.tab=Local file');
    await app.client.pause(timing.short);
    await matchImageSnapshot(app);
    // if (repeat) {
    //   await app.client.waitForVisible('h2=Update protocol installation');
    //   await app.client.click('button=Continue');
    // }
    // await app.client.pause(timing.medium);
    // await app.client.waitForVisible('h4=Protocol imported successfully!');
    // await app.client.click('button=Continue');
    // await app.client.pause(timing.long);
    // await forceClick(app, '.overlay__close');
    // await app.client.waitForExist('.modal', timing.long, true); // e.g. not exist
  });
});
