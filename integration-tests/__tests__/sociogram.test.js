/* eslint-env jest */

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
  getSociogramCenter,
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
  await goToStage(app, 'sociogram');
};

describe('Sociogram', () => {
  beforeAll(setupTest);

  it('Can place nodes', async () => {
    // const size = await app.client.getViewportSize();
    const center = await getSociogramCenter(app);
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
    const center = await getSociogramCenter(app);

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
    const center = await getSociogramCenter(app);

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
