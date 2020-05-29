/* eslint-env jest */
import { dialogAddon as fakeDialog } from 'spectron-dialog-addon';
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
  await createNodes(app, [
    { name: 'foo', nickname: 'bar', age: '66', toggleGroup: 'Four' },
    { name: 'bazz', nickname: 'buzz', age: '55', toggleGroup: 'One' },
    { name: 'fizz', nickname: 'pop', age: '44', toggleGroup: 'Two' },
  ]);
  await createEdges(app);
  await goToStage(app, 'alter-edge-form-1');
};

describe('Alter Edge Form Interface', () => {
  beforeAll(setupApp);
  beforeAll(setupTest);
  afterAll(teardownApp);

  it('Renders the alter form correctly', async () => {
    await timelineNext(app);
    await matchImageSnapshot(app);
  });
});
