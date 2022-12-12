import environments from './environments';

export const isElectron = () => navigator.userAgent.indexOf("Electron") !== -1;

export const isDevMode = () => isElectron() && process.env.NODE_ENV === 'development';

export const isPreview = () => {
  console.warn('isPreview not implemented');
  // isElectron() && window.require('electron').remote.getGlobal('NETWORK_CANVAS_PREVIEW');
}

// Not supported on Cordova
export const getEnv = () => (isElectron() ? process.env : {});

export const isMacOS = () => {
  if (!isElectron()) { return false; }
  return window.platform?.environment === "darwin" || false;
}

export const isWindows = () => {
  if (!isElectron()) { return false; }
  return window.platform?.environment === "win32" || false;
}

export const isLinux = () => {
  if (!isElectron()) { return false; }
  return window.platform?.environment === "linux" || false;
}


export const isCordova = () => !!window.cordova;

export const isIOS = () => isCordova() && (/iOS/i).test(window.device.platform);

export const isAndroid = () => isCordova() && (/Android/i).test(window.device.platform);

export const isWeb = () => (!isCordova() && !isElectron());

const getEnvironment = () => {
  if (isCordova()) return environments.CORDOVA;
  if (isElectron()) return environments.ELECTRON;
  return environments.WEB;
};

const inEnvironment = (tree) => (...args) => tree(getEnvironment())(...args);

export default inEnvironment;
