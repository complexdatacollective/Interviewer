export const isElectron = () => !!window.require;

export const isMacOS = () => isElectron && window.require && window.require('os').platform() === 'darwin';

export const isWindows = () => isElectron && window.require && window.require('os').platform() === 'win32';

export const isLinux = () => isElectron && window.require && window.require('os').platform() === 'linux';

export const isCordova = () => !!window.cordova;
