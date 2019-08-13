/* eslint-env jest */
import { makeTestingApp, startApps, stopApps } from './helpers';

let app;

const setup = async () => {
  app = makeTestingApp('Network-Canvas');
  await startApps(app);
};

const teardown = async () => {
  await stopApps(app);
};

describe('Start screen', () => {
  beforeAll(setup);
  afterAll(teardown);

  it('on first load it shows no protocols installed', async () => {
    await app.client.isVisible('.getting-started');
  });
});
