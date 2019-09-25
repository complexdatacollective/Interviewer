import environments from './environments';

export const isElectron = () => !!window.electron;

export const isPreview = () =>
  isElectron() && window.electron.remote.getGlobal('NETWORK_CANVAS_PREVIEW');

export const isMacOS = () => isElectron() && window.os.platform() === 'darwin';

export const isWindows = () => isElectron() && window.os.platform() === 'win32';

export const isLinux = () => isElectron() && window.os.platform() === 'linux';

export const isCordova = () => !!window.cordova;

export const isIOS = () => isCordova() && (/iOS/i).test(window.device.platform);

export const isAndroid = () => isCordova() && (/Android/i).test(window.device.platform);

export const isWeb = () => (!isCordova() && !isElectron());

const getEnvironment = () => {
  if (isCordova()) return environments.CORDOVA;
  if (isElectron()) return environments.ELECTRON;
  return environments.WEB;
};

const inEnvironment = tree =>
  (...args) =>
    tree(getEnvironment())(...args);

export default inEnvironment;
