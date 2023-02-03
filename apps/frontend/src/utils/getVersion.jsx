/* eslint-disable */
import { isElectron, isCordova } from './Environment';

const getVersion = () => {
  // if (isElectron()) {
  //   const remote = require('electron').remote;  // eslint-disable-line global-require

  //   return new Promise((resolve) => {
  //     const version = remote.app.getVersion();
  //     resolve(version);
  //   });
  // }

  // if (isCordova()) {
  //   return cordova.getAppVersion.getVersionNumber();  // eslint-disable-line no-undef
  // }

  return Promise.resolve('7.0.0');
};

export default getVersion;
