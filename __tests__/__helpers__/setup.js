const wd = require('wd');

export const appium = wd.promiseChainRemote({
  hostname: 'localhost',
  port: 4723,
});

export const browser = wd.promiseChainRemote();

export const config = {
  IOS: {
    browserName: '',
    orientation: 'LANDSCAPE',
    'appium-version': '1.6.5',
    deviceName: 'iPad Air',
    platformName: 'iOS',
    platformVersion: '10.3',
    autoWebview: true,
    app: './platforms/ios/build/emulator/NetworkCanvas.app',
  },
  SAFARI: {
    browserName: 'safari',
  },
  CHROME: {
    browserName: 'chrome',
  },
};

export const getRemote = (type) => {
  switch (type) {
    case 'APPIUM':
      return appium;
    case 'BROWSER':
      return browser;
    default:
      return null;
  }
};

export const initPlatform = (remote, platform) => {
  const platformConfig = config[platform];
  switch (platform) {
    case 'IOS':
      return remote.init(platformConfig);
    default:
      return remote.init(platformConfig).get('http://127.0.0.1:3000');
  }
};
