const CORDOVA = Symbol('ENVIRONMENT/CORDOVA');
const ELECTRON = Symbol('ENVIRONMENT/ELECTRON');
const UNKNOWN = Symbol('ENVIRONMENT/UNKNOWN');

export const environments = {
  CORDOVA,
  ELECTRON,
  UNKNOWN,
};

export const isElectron = () => !!window.require;

export const isCordova = () => !!window.cordova;

const getEnvironment = () => {
  if (isCordova()) return CORDOVA;
  if (isElectron()) return ELECTRON;
  return UNKNOWN;
};

const inEnvironment = (tree) => {
  console.log(tree);
  return tree(getEnvironment());
};

export default inEnvironment;
