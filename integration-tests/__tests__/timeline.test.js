/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
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

// Set coordinates for a rectangle that covers the timeline
// This avoids issues with the rest of the app changing.
// Rect format (origin - top left):
//   x Number - The x coordinate of the origin of the rectangle (must be an integer).
//   y Number - The y coordinate of the origin of the rectangle (must be an integer).
//   width Number - The width of the rectangle (must be an integer).
//   height Number - The height of the rectangle (must be an integer).
const timelineCoords = {
  x: 0,
  y: 0,
  width: 135,
  height: 900,
};

describe('Timeline', () => {
  beforeAll(setupApp);
  beforeAll(setupTest);
  afterAll(teardownApp);

  describe('Forwards/back buttons', () => {
    it('Advances through prompts', async () => {
      // [data-clickable="start-interview"]
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Reverses through prompts', async () => {
      await app.client.click('.session-navigation__button--back');
      await app.client.click('.session-navigation__button--back');
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Advances through stages', async () => {
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.pause(500);
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Reverses through stages', async () => {
      await app.client.click('.session-navigation__button--back');
      await app.client.pause(500);
      await matchImageSnapshot(app, timelineCoords);
    });
  });

  it('Shows the percentage progress visually', async () => {
    // Go to first screen
    await goToStage(app, 'ego-form-1');
    await matchImageSnapshot(app, timelineCoords);
    // Go halfwayish
    await goToStage(app, 'sociogram2');
    await matchImageSnapshot(app, timelineCoords);
    // Go to finish screen
    await goToStage(app, 'markdown');
    await app.client.click('.session-navigation__button--next');
    await matchImageSnapshot(app, timelineCoords);
  });
});
