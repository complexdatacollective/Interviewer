/* eslint-env jest */

import {
  makeTestingApp,
  startApps,
  stopApps,
  matchImageSnapshot,
} from './helpers';
import {
  startInterview,
  goToStage,
} from './playbook';
import {
  loadDevelopmentProtocol,
} from './playbook-development-protocol';
import { timing } from '../config';

let app;

const setup = async () => {
  app = await makeTestingApp('Network-Canvas');
};

beforeAll(setup);

const setupTest = async () => {
  await app.client.url('#/reset');
  await app.client.waitUntilWindowLoaded();
  await loadDevelopmentProtocol(app);
  await startInterview(app);
};

const openSettingsMenu = async () => {
  await app.client.click('.session-navigation__progress-bar');
  await app.client.waitForVisible('.stages-menu');
};

const closeSettingsMenu = async () => {
  await app.client.click('#close-button');
  await app.client.waitForVisible('.session-navigation__progress-bar');
};

const stagesMenuCoords = {
  x: 0,
  y: 0,
  width: 595,
  height: 900,
};

describe('Timeline', () => {
  beforeAll(setupTest);
  afterEach(closeSettingsMenu);

  it('Renders stages menu', async () => {
    await openSettingsMenu();
    await matchImageSnapshot(app, stagesMenuCoords);
  });

  it('Opens with the current stage at the top (uses scrollTo)', async () => {
    await goToStage(app, 'namegenroster2'); // 8 items down
    await app.client.pause(timing.medium);
    await openSettingsMenu();
    await matchImageSnapshot(app, stagesMenuCoords);
  });

  it('Filters the stage list, and clears it returning the full list', async () => {
    await openSettingsMenu();
    await app.client.pause(timing.medium);
    await app.client.setValue('#stages-filter-input', 'socio');
    await app.client.pause(timing.long);
    await matchImageSnapshot(app, stagesMenuCoords);
    await app.client.keys('\uE003\uE003\uE003');
    await app.client.pause(timing.long);
    await matchImageSnapshot(app, stagesMenuCoords);
    await app.client.keys('\uE003\uE003');
    await app.client.pause(timing.long);
    await matchImageSnapshot(app, stagesMenuCoords);
  });
});
