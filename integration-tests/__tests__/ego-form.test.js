/* eslint-env jest */
import {
  makeTestingApp,
  matchImageSnapshot,
} from './helpers';
import {
  startInterview,
  goToStage,
  timelineNext,
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
  await app.client.url('#/reset');
  await app.client.waitUntilWindowLoaded();
  await loadDevelopmentProtocol(app);
  await startInterview(app);
};

describe('EgoForm Interface', () => {
  beforeAll(setupTest);

  it('Renders the ego form correctly', async () => {
    await matchImageSnapshot(app);
  });

  it('Allows leaving via Timeline if not changed', async () => {
    await goToStage(app, 'dyadcensus');
    await app.client.waitForVisible('.dyad-census__introduction');
  });

  it('Disallows leaving via Next if invalid', async () => {
    await goToStage(app, 'ego-form-1');
    await timelineNext(app);
    await app.client.waitForVisible('.form-field-text--has-error');
  });

  it('Warns, but allows leaving an invalid form via Timeline', async () => {
    await app.client.setValue('input[name="3377af3f-3c79-41da-9b0b-6570fb519b93"]', 'foo');
    await goToStage(app, 'dyadcensus');
    await app.client.waitForVisible('.dialog--confirm');
    await app.client.click('span=Cancel');
    await app.client.waitForVisible('.form-field-radio-group__error');
    await goToStage(app, 'dyadcensus');
    await app.client.waitForVisible('.dialog--confirm');
    await app.client.click('span=Discard changes');
    await app.client.waitForVisible('.dyad-census__introduction');
  });
});
