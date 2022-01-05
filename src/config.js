const PROTOCOL_EXTENSION = '.netcanvas';

// Target protocol schema version. Used to determine compatibility & migration
const APP_SCHEMA_VERSION = 6;

const DEVICE_API_VERSION = '2'; // X-Device-API-Version

const APP_SUPPORTED_SCHEMA_VERSIONS = [4, 5, 6];

const DEVELOPMENT_PROTOCOL_URL = 'https://github.com/complexdatacollective/development-protocol/releases/download/20210416130716-c6bbb73/Development.netcanvas';

module.exports = {
  PROTOCOL_EXTENSION,
  APP_SCHEMA_VERSION,
  APP_SUPPORTED_SCHEMA_VERSIONS,
  DEVELOPMENT_PROTOCOL_URL,
  DEVICE_API_VERSION,
};
