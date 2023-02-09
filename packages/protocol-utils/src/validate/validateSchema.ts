import schemas from '../schemas/compiled/index.js';

const getSchema = version =>
  schemas.find(({ version: _version }) => _version === version);

/**
 * Statically validate the protocol based on JSON schema
 */
const validateSchema = (protocol, forceVersion) => {
  const version = parseInt(forceVersion || protocol.schemaVersion, 10);

  if (isNaN(version)) {
    throw new Error('schemaVersion must be number-like');
  }

  if (forceVersion) {
    console.log(`Forcing validation against schema version ${version}`);
  }

  const schema = getSchema(version);

  // Check resultant version exists
  if (!schema) {
    return [new Error(`Provided schema version '${version}' is not defined`)];
  }

  // Validate
  const validator = schema.validator;
  validator(protocol, 'Protocol');
  return validator.errors || [];
};

export default validateSchema;
