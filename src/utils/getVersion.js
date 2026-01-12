/**
 * Get app version with secure API support.
 */
/* global cordova */
import { isElectron, isCordova } from './Environment';

const getVersion = () => {
  if (isElectron()) {
    if (window.electronAPI?.app?.getVersion) {
      return window.electronAPI.app.getVersion();
    }
    return Promise.resolve('0.0.0');
  }

  if (isCordova()) {
    return cordova.getAppVersion.getVersionNumber();
  }

  return Promise.resolve('0.0.0');
};

export default getVersion;
