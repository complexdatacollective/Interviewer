/* eslint-env jest */

import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
  matchImageSnapshot,
} from './helpers';
import {
  startInterview,
  goToStage,
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
  await goToStage(app, 'namegen1');
};

describe('Name generator', () => {
  // beforeAll(setupApp);
  beforeAll(setupTest);
  // afterAll(teardownApp);

  it('Can create a node', async () => {
    await forceClick(app, '[data-clickable="open-add-node"]');

    await app.client.click('h1=Add A Person');

    await matchImageSnapshot(app);

    // name
    await app.client.setValue('input[name="6be95f85-c2d9-4daf-9de1-3939418af888"]', 'foo');
    // nickname
    await app.client.setValue('input[name="0e75ec18-2cb1-4606-9f18-034d28b07c19"]', 'bar');
    // age
    await app.client.setValue('input[name="c5fee926-855d-4419-b5bb-54e89010cea6"]', '66');
    // toggle group
    await app.client
      .$('[name="e343a91f-628d-4175-870c-957beffa0154"]')
      .click('label*=Four');

    await matchImageSnapshot(app);

    await app.client.click('button=Finished');

    await matchImageSnapshot(app);

    await app.client.waitForVisible('.node*=bar');
  });

  it('Can edit a node', async () => {
    // open node for editing
    await app.client.click('(//div[@class="node"])[2]');

    // edit node
    await app.client.setValue('input[name="0e75ec18-2cb1-4606-9f18-034d28b07c19"]', 'buzz');
    await app.client.click('button=Finished');

    // check change is visible
    await app.client.waitForVisible('.node*=buzz');
  });

  it('Can delete a node', async () => {
    await app.client.moveToObject('//div[@class="name-generator-interface__nodes"]//div[@class="node"]');
    await app.client.buttonDown(0);
    await app.client.pause(100); // wait for bin to appear
    await app.client.moveToObject('//div[@class="node-bin"]');
    await app.client.buttonUp(0);

    // check no nodes in main nodes list
    await app.client.waitForExist('//div[@class="name-generator-interface__nodes"]//div[@class="node"]', 500, true);
  });

  it('Can use a node from the panel', async () => {
    await app.client.moveToObject('//div[@class="name-generator-interface__panels"]//div[@class="node"]');
    await app.client.buttonDown(0);
    await app.client.moveToObject('//div[@class="name-generator-interface__nodes"]');
    await app.client.buttonUp(0);

    // check for a node in the main nodes list
    await app.client.waitForExist('//div[@class="name-generator-interface__nodes"]//div[@class="node"]');
  });
});
