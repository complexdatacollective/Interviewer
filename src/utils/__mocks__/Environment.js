/* eslint-env jest */

import environments from '../../utils/environments';

export const isElectron = () => !!window.require;

export const isCordova = () => !!window.cordova;

export const isWeb = () => (!isCordova() && !isElectron());

const getEnvironment = jest.fn().mockReturnValue(environments.WEB);

const inEnvironment = tree =>
  (...args) =>
    tree(getEnvironment())(...args);

export { getEnvironment };

export default inEnvironment;
