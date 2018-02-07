import environments from './environments';

export const isElectron = () => !!window.require;

export const isMacOS = () => isElectron && window.require && window.require('os').platform() === 'darwin';

export const isWindows = () => isElectron && window.require && window.require('os').platform() === 'win32';

export const isLinux = () => isElectron && window.require && window.require('os').platform() === 'linux';

export const isCordova = () => !!window.cordova;

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
