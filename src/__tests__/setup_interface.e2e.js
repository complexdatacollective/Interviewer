/* eslint-env jest */
/* eslint-disable no-var */

require('./__helpers__/environment');
const { getRemote, initPlatform } = require('./__helpers__/setup');
const { start } = require('./__helpers__/navigation');

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
  start({ remote })
    .nodeify(done);
});

describe('Setup screen', () => {
  it('Load demo protocol', () =>
    remote
      .elementById('load-demo-protocol')
      .click()
      .sleep(2000) // Wait for transition
      .hasElementByCssSelector('.protocol')
      .then(hasElement => expect(hasElement).toBe(true)),
  );

  // Tested elsewhere
  // it('Load external protocol');
});
