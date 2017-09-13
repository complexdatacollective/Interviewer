/* eslint-env jest */
/* eslint-disable no-var */

require('../__helpers__/environment');
const { getRemote, initPlatform } = require('../__helpers__/setup');
const { goToScreen, dragAndDrop } = require('../__helpers__/navigation');

const remote = getRemote(process.env.END_TO_END_REMOTE);

beforeAll(() =>
  initPlatform(remote, process.env.END_TO_END_PLATFORM)
    .then(() => goToScreen({ remote }, 1)),
);

afterAll(() =>
  remote
    .sleep(2000)
    .quit()
);

describe('Name generator screen', () => {
  it('Load name generator', () =>
    remote
      .hasElementByCss('.name-generator-interface')
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
      .sendKeys('80')
      .elementByCss('.modal button[type=submit]')
      .click()
      .sleep(1000)
      .elementByCss('.name-generator-interface__nodes .node')
      .text()
      .then(text => expect(text).toEqual('Motoko K')),
  );

  it('Can edit a node', () =>
    remote
      .elementsByCss('.name-generator-interface__nodes .node')
      .nth(1)
      .click()
      .sleep(1000)
      .elementByName('name')
      .clear()
      .sendKeys('Daisuke Aramaki')
      .elementByName('nickname')
      .clear()
      .sendKeys('Aramaki')
      .elementByName('age')
      .clear()
      .sendKeys('99')
      .elementByCss('.modal button[type=submit]')
      .click()
      .sleep(1000)
      .elementByCss('.name-generator-interface__nodes .node')
      .text()
      .then(text => expect(text).toEqual('Aramaki')),
  );

  it('Can drag a node from previous nodes', () =>
    remote
      .elementByCss('.name-generator-interface')
      .then(() =>
        dragAndDrop(
          { remote },
          () => remote.elementByCss('.panel .node'),
          () => remote.elementByCss('.name-generator-interface__nodes .node-list'),
        ),
      )
      .sleep(1000)
      .elementsByCss('.name-generator-interface__nodes .node')
      .second()
      .text()
      .then(text => expect(text).toEqual('Annie')),
  );
});
