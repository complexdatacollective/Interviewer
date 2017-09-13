/* eslint-disable */
import Promise from 'bluebird';
import { isElectron, isCordova } from '../utils/Environment';

const getVersion = () => {
  if (isElectron()) {
    const remote = require('electron').remote;  // eslint-disable-line global-require

    return new Promise((resolve) => {
      const version = remote.app.getVersion();
      resolve(version);
    });
  }

  if (isCordova()) {
    return cordova.getAppVersion.getVersionNumber();  // eslint-disable-line no-undef
  }

  return new Promise((resolve) => { resolve('0.0.0'); });
};

export default getVersion;
