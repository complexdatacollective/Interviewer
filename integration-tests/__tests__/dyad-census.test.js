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
  timelineNext,
  timelinePrevious,
} from './playbook';
import {
  createNodes,
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
  await createNodes(app, [
    { name: 'foo', nickname: 'bar', age: '66', toggleGroup: 'Four' },
    { name: 'bazz', nickname: 'buzz', age: '55', toggleGroup: 'One' },
    { name: 'fizz', nickname: 'pop', age: '44', toggleGroup: 'Two' },
  ]);
  await goToStage(app, 'dyadcensus');
};

describe('Dyad Census Interface', () => {
  beforeAll(setupTest);

  it('Renders the dyad census correctly', async () => {
    await timelineNext(app);
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 33.333%;"]', 500, true);
    await matchImageSnapshot(app);
  });

  it('Advances the progress bar', async () => {
    await app.client.click('div=Yes');
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 66.667%;"]', 500, true);
  });

  it('Shows previously created links', async () => {
    await app.client.pause(timing.medium);
    await timelinePrevious(app);
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 33.333%;"]', 500, true);
    await app.client.pause(timing.long);
    await matchImageSnapshot(app);
  });

  it('Cannot advance past unanswered pairs', async () => {
    await timelineNext(app);
    await timelineNext(app);
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 66.667%;"]', 500, true);
    await app.client.pause(timing.long);
    await matchImageSnapshot(app);
  });

  it('Advances to the next prompt', async () => {
    await app.client.click('div=Yes');
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 100%;"]', 500, true);
    await app.client.pause(timing.long);
    await app.client.click('div=No');
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 33.333%;"]', 500, true);
    await app.client.pause(timing.long);
    await matchImageSnapshot(app);
  });

  it('Remembers previous no answers', async () => {
    await timelinePrevious(app);
    await app.client.pause(timing.long);
    await app.client.waitForExist('//div[@class="progress-bar__filler" and style="width: 100%;"]', 500, true);
    await app.client.waitForExist('//div[@class="dyad-census__no"]//input[@class="form-field-togglebutton__input" and value="true" and checked]', 500, true);
  });
});
