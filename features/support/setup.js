const { defineSupportCode } = require('cucumber');
const { Builder } = require('selenium-webdriver');

const platform = process.env.PLATFORM || 'CHROME';

const buildChromeDriver = () =>
  new Builder().forBrowser('chrome').build();

const buildDriver = () => {
  switch (platform) {
    default:
      return buildChromeDriver();
  }
};

function World() {
  console.log('ran mee');
  this.driver = buildDriver();
}

defineSupportCode(({ setWorldConstructor }) => {
  setWorldConstructor(World);
});
