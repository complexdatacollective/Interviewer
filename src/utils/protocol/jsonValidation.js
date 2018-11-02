const Validator = require('./Validator');

const undefinedFormVariables = (form, variableRegistry) =>
  form.fields
    .map(f => f.variable)
    .filter(variable => !variableRegistry[form.entity][form.type].variables[variable]);

const nodeVarsIncludeDisplayVar = node =>
  !node.displayVariable // displayVariable is optional
    || Object.keys(node.variables).some(variableId => variableId === node.displayVariable);

/**
 * Define and run all dynamic validations (which aren't covered by the JSON Schema)
 */
const validateProtocol = (protocol) => {
  const v = new Validator(protocol);
  const registry = protocol.variableRegistry;

  v.addValidation('variableRegistry.node.*',
    nodeType => nodeVarsIncludeDisplayVar(nodeType),
    nodeType => `node displayVariable "${nodeType.displayVariable}" did not match any node variable`);

  v.addValidation('stages[].form',
    form => protocol.forms && protocol.forms[form],
    form => `protocol.forms does not contain the form "${form}"`,
  );

  v.addValidationSequence('stages[].subject',
    [
      subject => registry[subject.entity],
      subject => `"${subject.entity}" is not defined in the variableRegistry`,
    ],
    [
      subject => Object.keys(registry[subject.entity]).includes(subject.type),
      subject => `"${subject.type}" definition not found in variableRegistry["${subject.entity}"]`,
    ],
  );

  v.addValidationSequence('forms.*',
    [
      form => registry[form.entity],
      form => `form entity "${form.entity}" is not defined in the variableRegistry`,
    ],
    [
      form => registry[form.entity][form.type],
      form => `"${form.type}" definition not found in variableRegistry["${form.entity}"]`,
    ],
    [
      form =>
        form.fields.every(field => registry[form.entity][form.type].variables[field.variable]),
      form => `Undefined form field variables in variableRegistry: ${undefinedFormVariables(form, registry)}`,
    ],
  );

  v.runValidations();
  return v.errors;
};

module.exports = {
  validateProtocol,
};
