/* eslint-env node */
/* eslint-disable no-console */

/**
 * Usage:
 * npm run validate-protocol [protocol-path]
 *
 * Errors & Validation failures are written to stderr.
 */
const Chalk = require('chalk').constructor;
const fs = require('fs');
const os = require('os');
const path = require('path');

const JSZip = require('jszip');
const Ajv = require('ajv');

const projectDir = path.join(__dirname, '..', '..');
const schemaDir = path.join(projectDir, 'schema');
const defaultProtocol = path.join(projectDir, 'public', 'protocols', 'development.netcanvas', 'protocol.json');
const protocolArg = process.argv[2];
const protocolFilepath = protocolArg || defaultProtocol;
const protocolName = protocolArg ? path.basename(protocolFilepath) : 'development.netcanvas';
const exitOnValidationFailure = !!process.env.CI;

let protocolContents;

let schema;
let data;

const chalk = new Chalk({ enabled: !!process.stderr.isTTY });

const extractProtocolSource = async (zippedProtocol) => {
  const zip = new JSZip();
  const zipObject = await zip.loadAsync(zippedProtocol);
  const contents = await zipObject.file('protocol.json').async('string');
  return contents;
};

const validateJson = (jsonString) => {
  try {
    schema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'protocol.schema')));
  } catch (e) {
    console.error(chalk.red('Invalid schema'));
    console.error(chalk.red('Have you run `npm run generate-schema`?'));
    console.error();
    console.error(e);
    process.exit(1);
  }

  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    console.error(chalk.red('Invalid protocol file'));
    console.error(e);
    process.exit(1);
  }

  const ajv = new Ajv({
    allErrors: true,
  });
  ajv.addFormat('integer', /\d+/);

  const validate = ajv.compile(schema);
  const isValid = validate(data, 'Protocol');

  if (isValid) {
    console.log(`${protocolName} is valid`);
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

    if (exitOnValidationFailure) {
      process.exit(1);
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
