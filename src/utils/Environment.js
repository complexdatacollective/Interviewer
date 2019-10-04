import environments from './environments';

export const isElectron = () => !!window.require;

export const isPreview = () =>
  isElectron() && window.require('electron').remote.getGlobal('NETWORK_CANVAS_PREVIEW');

// Not supported on Cordova
export const getEnv = () =>
  (isElectron() ? process.env : {});

export const isMacOS = () => isElectron() && window.require('os').platform() === 'darwin';

export const isWindows = () => isElectron() && window.require('os').platform() === 'win32';

export const isLinux = () => isElectron() && window.require('os').platform() === 'linux';

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
