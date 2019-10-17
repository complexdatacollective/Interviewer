/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
  matchImageSnapshot,
  pause,
} from './helpers';
import {
  loadDevelopmentProtocol,
  startInterview,
  goToStage,
} from './playbook';

const app = makeTestingApp('Network-Canvas');

const setupApp = async () => {
  await fakeDialog.apply(app);
  await startApps(app);
};

const teardownApp = async () => {
  await stopApps(app);
};

const createNode = async ({
  name = 'foo',
  nickname = 'bar',
  age = 66,
  toggleGroup = 'Four',
}) => {
  await forceClick(app, '[data-clickable="open-add-node"]');
  // name
  await app.client.setValue('input[name="6be95f85-c2d9-4daf-9de1-3939418af888"]', name);
  // nickname
  await app.client.setValue('input[name="0e75ec18-2cb1-4606-9f18-034d28b07c19"]', nickname);
  // age
  await app.client.setValue('input[name="c5fee926-855d-4419-b5bb-54e89010cea6"]', age);
  // toggle group
  await app.client
    .$('[name="e343a91f-628d-4175-870c-957beffa0154"]')
    .click(`label*=${toggleGroup}`);
  await app.client.click('button=Finished');
  // otherwise the toggle groups don't reset?
  await pause(app, 250);
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
};

const createNodes = async (nodes = []) => {
  await goToStage(app, 'namegen1');
  await asyncForEach(nodes, createNode);
};

const setupTest = async () => {
  await app.client.url('#/reset');
  await app.client.waitUntilWindowLoaded();
  await loadDevelopmentProtocol(app);
  await startInterview(app);
  await createNodes([
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
    await pause(app, 'medium');

    // WARN: this may have problems since the highlight is animated.
    // increased threshold to help
    await matchImageSnapshot(
      app,
      { customDiffConfig: { threshold: 0.05 } },
    );

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

    await pause(app, 'medium');

    await matchImageSnapshot(app);
  });
});
