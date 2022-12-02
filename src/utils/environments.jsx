const CORDOVA = Symbol('ENVIRONMENT/CORDOVA');
const ELECTRON = Symbol('ENVIRONMENT/ELECTRON');
const WEB = Symbol('ENVIRONMENT/WEB');
const UNKNOWN = Symbol('ENVIRONMENT/UNKNOWN');

const environments = {
  CORDOVA,
  ELECTRON,
  WEB,
  UNKNOWN,
};

export default environments;
