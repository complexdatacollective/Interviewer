/* eslint-env node */
/* eslint-disable no-console */

/**
 * Usage:
 * npm run validate-protocol [protocol-path]
 */
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');

const JSZip = require('jszip');
const Ajv = require('ajv');
const v6Schema = require('ajv/lib/refs/json-schema-draft-06.json');

const projectDir = path.join(__dirname, '..', '..');
const defaultProtocol = path.join(projectDir, 'public', 'protocols', 'development.netcanvas', 'protocol.json');
const protocolFilepath = process.argv[2] || defaultProtocol;
const protocolName = path.basename(path.dirname(protocolFilepath));

let protocolContents;

let schema;
let data;

const extractProtocolSource = async (zippedProtocol) => {
  const zip = new JSZip();
  const zipObject = await zip.loadAsync(zippedProtocol);
  const contents = await zipObject.file('protocol.json').async('string');
  return contents;
};

const validateJson = (jsonString) => {
  try {
    schema = JSON.parse(fs.readFileSync(path.join(projectDir, 'protocol.schema')));
  } catch (e) {
    console.error(chalk.red('Invalid schema'));
    console.error(e);
    process.exit(1);
  }

  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    console.error(chalk.red('Invalid protocol file'));
    console.error(e);
    process.exit(0);
  }

  const ajv = new Ajv({
    allErrors: true,
  });
  ajv.addMetaSchema(v6Schema);
  ajv.addFormat('integer', /\d+/);

  const validate = ajv.compile(schema);
  const isValid = validate(data, 'Protocol');

  if (isValid) {
    console.log(`The ${protocolName} protocol is valid.`);
  } else {
    console.error(chalk.red(`${protocolName} has errors:`));
    console.warn('-', ajv.errorsText(validate.errors, { separator: `${os.EOL}- ` }));

    const addlPropErrors = validate.errors.filter(err => err.keyword === 'additionalProperties');
    if (addlPropErrors.length) {
      console.warn('');
      console.warn('additionalProperty error details:');
      addlPropErrors.forEach((err) => {
        console.warn('-', `${err.dataPath} has "${err.params.additionalProperty}"`, os.EOL);
      });
    }
  }
};

try {
  protocolContents = fs.readFileSync(protocolFilepath);
} catch (err) {
  console.error(err);
  process.exit(1);
}

if (protocolFilepath.match(/\.netcanvas$/)) {
  extractProtocolSource(protocolContents)
    .then(jsonString => validateJson(jsonString));
} else {
  validateJson(fs.readFileSync(protocolFilepath));
}
