const PROTOCOL_EXTENSION = '.netcanvas';

// Target protocol schema version. Used to determine compatibility & migration
const APP_SCHEMA_VERSION = 4;

const DEVICE_API_VERSION = '2'; // X-Device-API-Version

const APP_SUPPORTED_SCHEMA_VERSIONS = [4];

const DEVELOPMENT_PROTOCOL_URL = 'https://github.com/complexdatacollective/development-protocol/releases/download/20201125120304-d9c0394/Development.netcanvas';

const ALLOWED_MARKDOWN_TAGS = [
  'break',
  'emphasis',
  'heading',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'thematicBreak',
];

const ALLOWED_MARKDOWN_PROMPT_TAGS = [
  'paragraph',
  'emphasis',
  'strong',
];

module.exports = {
  PROTOCOL_EXTENSION,
  ALLOWED_MARKDOWN_TAGS,
  ALLOWED_MARKDOWN_PROMPT_TAGS,
  APP_SCHEMA_VERSION,
  APP_SUPPORTED_SCHEMA_VERSIONS,
  DEVELOPMENT_PROTOCOL_URL,
  DEVICE_API_VERSION,
};
