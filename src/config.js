// Target protocol schema version. Used to determine compatibility & migration
const APP_SCHEMA_VERSION = 2;

const APP_SUPPORTED_SCHEMA_VERSIONS = ['1.0.0', 1, 2];

const DEVELOPMENT_PROTOCOL_URL = 'https://github.com/codaco/development-protocol/releases/download/20191011105845-fdad2bc/Development.netcanvas';

module.exports = {
  APP_SCHEMA_VERSION,
  APP_SUPPORTED_SCHEMA_VERSIONS,
  DEVELOPMENT_PROTOCOL_URL,
};
