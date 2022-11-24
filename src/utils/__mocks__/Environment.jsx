/* eslint-env jest */

import environments from '../environments';

export const isElectron = () => !!window.require;

export const getEnv = () => ({});

export const isCordova = () => !!window.cordova;

export const isIOS = () => isCordova() && (/iOS/i).test(window.device.platform);

export const isAndroid = () => isCordova() && (/Android/i).test(window.device.platform);

export const isWindows = () => false;

export const isPreview = () => false;

export const isWeb = () => (!isCordova() && !isElectron());

const getEnvironment = jest.fn().mockReturnValue(environments.WEB);

const inEnvironment = (tree) => (...args) => tree(getEnvironment())(...args);

export { getEnvironment };

export default inEnvironment;
