const wd = require('wd');

const Q = wd.Q;

export const times = (func, n) =>
  () =>
    new Array(n)
      .fill(null)
      .reduce(
        r => r.then(func),
        Promise.resolve(),
      );

export const start = ({ remote }) =>
  remote
    .refresh()
    // Wait for intro screen
    .sleep(2000);

export const loadTestProtocol = ({ remote }) =>
  start({ remote })
    .elementByName('protocol_url')
    .sendKeys('https://raw.githubusercontent.com/codaco/Network-Canvas-example-protocols/master/test.protocol.js')
    .elementByCssSelector('.setup__custom-protocol button[type=submit]')
    .click()
    .sleep(2000);

export const goToScreen = ({ remote }, screenNumber) => {
  const numberOfClicksNeeded = screenNumber - 1;

  const nextStage = () => remote.elementById('next-stage').click().sleep(2000);

  const clicks = times(
    nextStage,
    numberOfClicksNeeded,
  );

  return loadTestProtocol({ remote })
    .then(() => clicks());
};

export const dragAndDrop = ({ remote }, from, to) =>
  Q.all([
    from(),
    to(),
  ]).then(
    els =>
      remote
        .moveTo(els[0])
        .buttonDown()
        .sleep(100)
        .moveTo(els[1])
        .buttonUp()
        .sleep(100),
  );

