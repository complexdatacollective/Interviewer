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

const expectPairingToComplete = async () => {
  await app.client.waitUntilWindowLoaded();
  await app.client.waitForExist('#root');
  // await app.client.waitForExist('.server-card--clickable');
  await app.client.click('[name=add-a-protocol]');

  await app.client.waitForExist('#forever');
};

// // Assumes pairing has completed in expectPairingToComplete
// const showsThePairedServer = async () => {
//   await ncApp.client.click('.setup__server-button');
//   await ncApp.client.waitForExist('.server-card__label');
//   expect(ncApp.client.getText('.server-setup__server .button')).resolves.toMatch(/Unpair/i);
// };

describe('Server/Client pairing', () => {
  beforeEach(setup);
  afterEach(teardown);
  it('completes successfully', expectPairingToComplete);
});

// module.exports = {
//   setup,
//   teardown,
//   tests: [
//     expectPairingToComplete,
//   ],
// };
