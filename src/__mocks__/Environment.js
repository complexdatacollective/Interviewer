import environments from '../utils/environments';

/* arbitrarily default to electron */

export const isElectron = () => true;
export const isCordova = () => false;

const getEnvironment = () => environments.ELECTRON;

const inEnvironment = tree =>
  tree(getEnvironment());

export default inEnvironment;
