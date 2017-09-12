/* eslint-env jest */
/* eslint-disable no-var */

require('../__helpers__/environment');
const { getRemote, initPlatform } = require('../__helpers__/setup');
const { goToScreen, dragAndDrop } = require('../__helpers__/navigation');

const remote = getRemote(process.env.END_TO_END_REMOTE);

beforeAll((done) => {
  initPlatform(remote, process.env.END_TO_END_PLATFORM)
    .nodeify(done);
});

afterAll((done) => {
  remote
    .sleep(500)
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

  it('Can add a new node', () =>
    remote
      .elementById('open-add-node-modal')
      .click()
      .sleep(1000)
      .elementByName('name')
      .sendKeys('Motoko Kusanagi')
      .elementByName('nickname')
      .click()
      .elementByName('age')
      .sendKeys('99')
      .elementByCssSelector('.modal button[type=submit]')
      .click()
      .sleep(5000)
      .elementByCssSelector('.name-generator-interface__nodes .node')
      .text()
      .then(text => expect(text).toEqual('Motoko K')),
  );

  it('Can drag a from previous nodes node', () =>
    remote
      .sleep(1)
      .then(() =>
        dragAndDrop(
          { remote },
          () => remote.elementByCssSelector('.panel').elementByCssSelector('.node'),
          () => remote.elementByCssSelector('.name-generator-interface__nodes .node-list'),
        ),
      )
      .sleep(5000)
      .elementByCssSelector('.name-generator-interface__nodes .node')
      .text()
      .then(text => expect(text).toEqual('Annie')),
  );
});
