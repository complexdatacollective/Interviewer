const Ajv = require('ajv');

const defaultSchema = require('../../../schemas/protocol.schema.json');

/**
 * Statically validate the protocol based on its JSON schema
 */
const validateSchema = (protocol, schema = defaultSchema) => {
  const ajv = new Ajv({
    allErrors: true,
  });
  ajv.addFormat('integer', /\d+/);

  const validate = ajv.compile(schema);
  validate(protocol, 'Protocol');
  return validate.errors || [];
};

module.exports = validateSchema;
