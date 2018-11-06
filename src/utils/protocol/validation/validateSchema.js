const Ajv = require('ajv');

const { v1 } = require('../../../schemas/');

/**
 * Statically validate the protocol based on its JSON schema
 */
const validateSchema = (protocol, schema = v1) => {
  const ajv = new Ajv({
    allErrors: true,
  });
  ajv.addFormat('integer', /\d+/);

  const validate = ajv.compile(schema);
  validate(protocol, 'Protocol');
  return validate.errors || [];
};

module.exports = validateSchema;
