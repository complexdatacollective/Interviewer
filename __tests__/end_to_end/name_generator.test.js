/* eslint-env jest */
/* eslint-disable no-var */

require('../__helpers__/environment');
const { getRemote, initPlatform } = require('../__helpers__/setup');
const { goToScreen } = require('../__helpers__/navigation');

const remote = getRemote(process.env.END_TO_END_REMOTE);

beforeAll((done) => {
  initPlatform(remote, process.env.END_TO_END_PLATFORM)
    .nodeify(done);
});

afterAll((done) => {
  remote
    .quit()
    .nodeify(done);
});

beforeEach((done) => {
  goToScreen({ remote }, 1)
    .nodeify(done);
});

describe('Name generator screen', () => {
  it('Load name generator', () =>
    remote
      .hasElementByCssSelector('.name-generator-interface')
      .then(hasElement => expect(hasElement).toBe(true)),
  );
});
