/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import {
  makeTestingApp,
  startApps,
  stopApps,
  matchImageSnapshot,
  pause,
} from './helpers';
import {
  startInterview,
  goToStage,
} from './playbook';
import {
  createNodes,
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
  await goToStage(app, 'sociogram');
};

const getCenter = async (_app) => {
  const size = await _app.client.getElementSize('//div[@class="sociogram-interface"]');
  return {
    x: size.width * 0.5,
    y: size.height * 0.5,
  };
};

describe('Sociogram', () => {
  beforeAll(setupApp);
  beforeAll(setupTest);
  afterAll(teardownApp);

  it('Can place nodes', async () => {
    // const size = await app.client.getViewportSize();
    const center = await getCenter(app);
    await app.client.moveToObject('//div[@class="node-bucket"]//div[@class="node"]');
    await app.client.buttonDown(0);
    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y - 100,
    );
    await pause(app, 'medium');
    await app.client.buttonUp(0);

    await app.client.moveToObject('//div[@class="node-bucket"]//div[@class="node"]');
    await app.client.buttonDown(0);
    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y + 100,
    );
    await pause(app, 'medium');
    await app.client.buttonUp(0);

    await app.client.moveToObject('//div[@class="node-bucket"]//div[@class="node"]');
    await app.client.buttonDown(0);
    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x + 100,
      center.y - 100,
    );
    await pause(app, 'medium');
    await app.client.buttonUp(0);

    await matchImageSnapshot(app);
  });

  it('Shows active state when selecting a node', async () => {
    const center = await getCenter(app);

    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y - 100,
    );
    await app.client.buttonPress(0);

    // use class selector, as visuals are animated
    await app.client.waitForExist('.node.node--linking');

    // de-select
    await app.client.buttonPress(0);
  });

  it('Can connect nodes', async () => {
    const center = await getCenter(app);

    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y - 100,
    );
    await app.client.buttonPress(0);

    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y + 100,
    );
    await app.client.buttonPress(0);

    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x - 100,
      center.y + 100,
    );
    await app.client.buttonPress(0);

    await app.client.moveToObject(
      '//div[@class="sociogram-interface"]',
      center.x + 100,
      center.y - 100,
    );
    await app.client.buttonPress(0);

    await matchImageSnapshot(app);
  });
});
