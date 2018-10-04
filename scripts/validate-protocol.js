/* eslint-env node */
/* eslint-disable no-console */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const Ajv = require('ajv');
const v6Schema = require('ajv/lib/refs/json-schema-draft-06.json');

const defaultProtocol = path.join(__dirname, '..', 'public', 'protocols', 'development.netcanvas', 'protocol.json');
const protocolFilepath = process.argv[2] || defaultProtocol;
const protocolName = path.basename(path.dirname(protocolFilepath));

let schema;
let data;

try {
  schema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'protocol.schema')));
} catch (e) {
  console.error(chalk.red('Invalid schema'));
  console.error(e);
  process.exit(1);
}

try {
  data = JSON.parse(fs.readFileSync(protocolFilepath));
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
  console.log('-', ajv.errorsText(validate.errors, { separator: '\n- ' }));
}
