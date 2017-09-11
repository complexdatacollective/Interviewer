const wd = require('wd');

export const app = wd.promiseChainRemote({
  hostname: 'localhost',
  port: 4723,
});

export const browser = wd.promiseChainRemote();

export const config = {
  iOS: {
    browserName: '',
    orientation: 'LANDSCAPE',
    'appium-version': '1.6.5',
    deviceName: 'iPad Air',
    platformName: 'iOS',
    platformVersion: '10.3',
    autoWebview: true,
    app: './platforms/ios/build/emulator/NetworkCanvas.app',
  },
  safari: {
    browserName: 'safari',
  },
  chrome: {
    browserName: 'chrome',
  },
};

export const appDriver = () => app.init(config.iOS);
export const safariDriver = () => browser.init(config.safari).get('localhost:3000');
