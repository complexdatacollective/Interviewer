/* eslint-env jest */

import fakeDialog from 'spectron-fake-dialog';
import {
  makeTestingApp,
  startApps,
  stopApps,
  forceClick,
} from '../helpers';
import {
  loadEmptyProtocol,
  loadDevelopmentProtocol,
  startInterview,
  goToStage,
  debug,
} from '../playbook';
import { timing } from '../../config';

const app = makeTestingApp('Network-Canvas');

// export const navigateToNameGenerator = async () => {
//   app.client
// };

const setupApp = async () => {
  await fakeDialog.apply(app);
  await startApps(app);
  await app.browserWindow.setSize(1280, 800);
  await app.browserWindow.openDevTools({ mode: 'detach' });
};

const teardownApp = async () => {
  // Uncomment to investigate inspector
  // await debug(app);

  await stopApps(app);
};

const setupTest = async () => {
  await app.client.url('#/reset');
  await app.client.waitUntilWindowLoaded();
  await loadDevelopmentProtocol(app);
  await startInterview(app);
  await goToStage(app, 'namegen1');
};

describe('Name generator', () => {
  beforeAll(setupApp);
  beforeAll(setupTest);
  afterAll(teardownApp);

  it('Can create a node', async () => {
    await forceClick(app, '[data-clickable="open-add-node"]');
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
    await app.client.click('button=Finished');

    await app.client.waitForVisible('.node*=bar');
  });

  it('Can edit a node', async () => {
    // open node for editing
    await app.client.$('.node*=bar').click('.node');

    // edit node
    await app.client.setValue('input[name="0e75ec18-2cb1-4606-9f18-034d28b07c19"]', 'buzz');    
    await app.client.click('button=Finished');
    
    // check change is visible
    await app.client.waitForVisible('.node*=buzz');
  });
});
