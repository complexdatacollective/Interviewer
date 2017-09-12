/* eslint-env jest */
/* eslint-disable no-var */

require('../__helpers__/environment');
const { getRemote, initPlatform } = require('../__helpers__/setup');
const { start } = require('../__helpers__/navigation');

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
  it('Load demo protocol', done =>
    remote
      .elementById('load-demo-protocol')
      .click()
      .sleep(2000) // Wait for transition
      .hasElementByCssSelector('.protocol')
      .then(hasElement => expect(hasElement).toBe(true))
      .nodeify(done),
  );

  it('Load external protocol', done =>
    remote
      .elementByName('protocol_url')
      .sendKeys('https://raw.githubusercontent.com/codaco/Network-Canvas-example-protocols/master/example.protocol.js')
      .elementByCssSelector('.setup__custom-protocol button[type=submit]')
      .click()
      .sleep(2000) // Wait for transition
      .hasElementByCssSelector('.protocol')
      .then(hasElement => expect(hasElement).toBe(true))
      .nodeify(done),
  );
});
