/* eslint-env jest */
/* eslint-disable no-var */
/* global jasmine */

const { remote, config } = require('../__helpers__/setup');

var driver;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

beforeAll((done) => {
  driver = remote.init(config.iOS10Hybrid)
    .then(() => {
      done();
    });
});

afterAll(() => {
  driver.fin(() => remote.quit());
});

beforeEach((done) => {
  driver
    .then(() => remote.refresh())
    .then(() => remote.sleep(1000))
    .then(() => {
      done();
    });
});

describe('Setup screen', () => {
  it('Can click a button', (done) => {
    driver
      .then(() => remote.elementById('demo'))
      .then(e => remote.clickElement(e))
      .then(() => remote.sleep(3000))
      .then(() => {
        done();
      });
  });

  it('Can click a button again', (done) => {
    driver
      .then(() => remote.elementById('demo'))
      .then(e => remote.clickElement(e))
      .then(() => remote.sleep(3000))
      .then(() => {
        done();
      });
  });
});
