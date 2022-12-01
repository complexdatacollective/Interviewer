const PROTOCOL_EXTENSION = '.netcanvas';

// Target protocol schema version. Used to determine compatibility & migration
const APP_SCHEMA_VERSION = 7;

const DEVICE_API_VERSION = '2'; // X-Device-API-Version

const APP_SUPPORTED_SCHEMA_VERSIONS = [4, 5, 6, 7, 8];

const DEVELOPMENT_PROTOCOL_URL_V4 = 'https://github.com/complexdatacollective/development-protocol/releases/download/20201207104100-8547e9b/Development.netcanvas';
const DEVELOPMENT_PROTOCOL_URL_V5 = 'https://github.com/complexdatacollective/development-protocol/releases/download/20210416130716-c6bbb73/Development.netcanvas';
const DEVELOPMENT_PROTOCOL_URL_V6 = 'https://github.com/complexdatacollective/development-protocol/releases/download/20220130211710-1908698/Development.netcanvas';
const DEVELOPMENT_PROTOCOL_URL_V7 = 'https://github.com/complexdatacollective/development-protocol/releases/download/20220311112556-19d1939/Development.netcanvas';
const DEVELOPMENT_PROTOCOL_URL_V8 = 'https://github.com/complexdatacollective/development-protocol/releases/download/20220914054719-b7281b1/Development.netcanvas';

// Cannonical for this version
const DEVELOPMENT_PROTOCOL_URL = DEVELOPMENT_PROTOCOL_URL_V8;

export {
  PROTOCOL_EXTENSION,
  APP_SCHEMA_VERSION,
  APP_SUPPORTED_SCHEMA_VERSIONS,
  DEVELOPMENT_PROTOCOL_URL,
  DEVELOPMENT_PROTOCOL_URL_V4,
  DEVELOPMENT_PROTOCOL_URL_V5,
  DEVELOPMENT_PROTOCOL_URL_V6,
  DEVELOPMENT_PROTOCOL_URL_V7,
  DEVELOPMENT_PROTOCOL_URL_V8,
  DEVICE_API_VERSION,
};
