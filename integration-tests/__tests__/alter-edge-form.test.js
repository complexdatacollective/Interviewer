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
} from './playbook';
import {
  createNodes,
  createEdges,
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
  await createNodes(app, [
    { name: 'foo', nickname: 'bar', age: '66', toggleGroup: 'Four' },
    { name: 'bazz', nickname: 'buzz', age: '55', toggleGroup: 'One' },
    { name: 'fizz', nickname: 'pop', age: '44', toggleGroup: 'Two' },
  ]);
  await createEdges(app);
  await goToStage(app, 'alter-edge-form-1');
};

describe('Alter Edge Form Interface', () => {
  beforeAll(setupTest);

  it('Renders the alter form correctly', async () => {
    await timelineNext(app);
    await matchImageSnapshot(app);
  });
});
