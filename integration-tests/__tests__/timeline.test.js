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
  width: 125,
  height: 900,
};

describe('Timeline', () => {
  beforeAll(setupTest);

  describe('Forwards/back buttons', () => {
    it('Advances through prompts', async () => {
      // [data-clickable="start-interview"]
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.pause(timing.medium);
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Reverses through prompts', async () => {
      await app.client.click('.session-navigation__button--back');
      await app.client.click('.session-navigation__button--back');
      await app.client.pause(timing.medium);
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Advances through stages', async () => {
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.click('.session-navigation__button--next');
      await app.client.pause(timing.medium);
      await matchImageSnapshot(app, timelineCoords);
    });

    it('Reverses through stages', async () => {
      await app.client.click('.session-navigation__button--back');
      await app.client.pause(timing.medium);
      await matchImageSnapshot(app, timelineCoords);
    });
  });

  it('Shows the percentage progress visually', async () => {
    // Go to first screen
    await goToStage(app, 'ego-form-1');
    await app.client.pause(timing.medium);
    await matchImageSnapshot(app, timelineCoords);
    // Go halfwayish
    await goToStage(app, 'sociogram2');
    await app.client.pause(timing.medium);
    await matchImageSnapshot(app, timelineCoords);
    // Go to finish screen
    await goToStage(app, 'markdown');
    await app.client.pause(timing.medium);
    await app.client.click('.session-navigation__button--next');
    await app.client.pause(timing.medium);
    await matchImageSnapshot(app, timelineCoords);
  });
});
