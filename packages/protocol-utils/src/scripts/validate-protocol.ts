import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import validateProtocol, { ValidationError } from '../validate/validateProtocol.js';
import { errToString } from '../validate/helpers.js';
import chalk from 'chalk';

/**
 * Usage:
 * npm run validate-protocol [protocol-path]
 *
 * Errors & Validation failures are written to stderr.
 */


const protocolArg = process.argv[2];
const forceSchemaArg: string = process.argv[3];

if (!protocolArg) {
  console.error(chalk.red('You must specify a protocol file to validate.'));
  process.exit(1);
}

const protocolFilepath = protocolArg;
const protocolName = basename(protocolFilepath);
const exitOnValidationFailure = !!process.env.CI;


const validateJson = (jsonString: string) => {
  try {
    validateProtocol(jsonString, forceSchemaArg);

    console.log(chalk.green(`${protocolName} is valid.`));
  } catch (err) {
    // Test for our custom ValidationError
    if (err instanceof ValidationError) {
      console.log(chalk.red(`${protocolName} is NOT valid!`));
      if (err.schemaErrors.length) {
        console.error(`${protocolName} has the following schema errors:`);
        err.schemaErrors.forEach(err => console.warn('-', errToString(err)));
      }

      if (err.dataErrors.length) {
        console.error(`${protocolName} has the following data errors:`);
        err.dataErrors.forEach(err => console.warn('-', errToString(err)));
      }
    }

    // Otherwise, it's an internal error
    console.error(chalk.red(`${protocolName} has an internal validation error:`));
    console.error(err);

    if (exitOnValidationFailure) {
      process.exit(1);
    }
  }
};

let protocolContents;

try {
  protocolContents = await readFile(protocolFilepath, { encoding: 'utf8' });
} catch (err) {
  console.error(err);
  process.exit(1);
}

validateJson(protocolContents);
