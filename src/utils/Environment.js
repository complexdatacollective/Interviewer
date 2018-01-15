import environments from './environments';

export const isElectron = () => !!window.require;

export const isCordova = () => !!window.cordova;

const getEnvironment = () => {
  if (isCordova()) return environments.CORDOVA;
  if (isElectron()) return environments.ELECTRON;
  return environments.UNKNOWN;
};

const inEnvironment = tree =>
  tree(getEnvironment());

export default inEnvironment;
