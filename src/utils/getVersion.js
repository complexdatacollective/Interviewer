import { App } from '@capacitor/app';

import { isCapacitor, isElectron } from './Environment';

const getVersion = async () => {
  if (isElectron()) {
    if (window.electronAPI?.app?.getVersion) {
      return window.electronAPI.app.getVersion();
    }
    return '0.0.0';
  }

  if (isCapacitor()) {
    const info = await App.getInfo();
    return info.version;
  }

  return '0.0.0';
};

export default getVersion;
