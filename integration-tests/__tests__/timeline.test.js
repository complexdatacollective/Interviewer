/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
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

const app = makeTestingApp('Network-Canvas');

const setupApp = async () => {
  await fakeDialog.apply(app);
  await startApps(app);
};

const teardownApp = async () => {
  await stopApps(app);
};

const setupTest = async () => {
  await app.client.url('#/reset');
  await app.client.waitUntilWindowLoaded();
  await loadDevelopmentProtocol(app);
  await startInterview(app);
  await goToStage(app, 'namegen1');
};

describe('Timeline', () => {
  beforeAll(setupApp);
  beforeAll(setupTest);
  afterAll(teardownApp);

  describe('Forwards/back buttons', async () => {
    it('Advances through prompts', async () => {
      // [data-clickable="start-interview"]
      await app.client.click('.timeline-nav--next');
      await app.client.click('.timeline-nav--next');
      await matchImageSnapshot(app);
    });

    it('Reverses through prompts', async () => {
      await app.client.click('.timeline-nav--back');
      await app.client.click('.timeline-nav--back');
      await matchImageSnapshot(app);
    });

    it('Advances through stages', async () => {
      await app.client.click('.timeline-nav--next');
      await app.client.click('.timeline-nav--next');
      await app.client.click('.timeline-nav--next');
      await app.client.click('.timeline-nav--next');
      await app.client.pause(500);
      await matchImageSnapshot(app);
    });

    it('Reverses through stages', async () => {
      await app.client.click('.timeline-nav--back');
      await app.client.pause(500);
      await matchImageSnapshot(app);
    });
  });

  it('Shows the percentage progress visually', async () => {
    // Go to first screen
    await goToStage(app, 'ego-form-1');
    await matchImageSnapshot(app);
    // Go halfwayish
    await goToStage(app, 'sociogram2');
    await matchImageSnapshot(app);
    // Go to finish screen
    await goToStage(app, 'markdown');
    await app.client.click('.timeline-nav--next');
    await matchImageSnapshot(app);
  });
});
