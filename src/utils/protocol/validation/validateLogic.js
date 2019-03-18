const Validator = require('./Validator');
const {
  duplicateId,
  duplicateInArray,
  entityDefFromRule,
  getVariablesForSubject,
  getVariableNames,
  nodeVarsIncludeDisplayVar,
  undefinedFormVariables,
} = require('./helpers');

/**
 * Define and run all dynamic validations (which aren't covered by the JSON Schema).
 *
 * @return {string[]} an array of failure messages from the validator
 */
const validateLogic = (protocol) => {
  const v = new Validator(protocol);
  const registry = protocol.codebook;

  v.addValidation('codebook.node.*',
    nodeType => nodeVarsIncludeDisplayVar(nodeType),
    nodeType => `node displayVariable "${nodeType.displayVariable}" did not match any node variable`);

  v.addValidation('stages[].form',
    form => form === null || (protocol.forms && protocol.forms[form]), // `null` form is allowed
    form => `protocol.forms does not contain the form "${form}"`,
  );

  v.addValidationSequence('stages[].subject',
    [
      subject => registry[subject.entity],
      subject => `"${subject.entity}" is not defined in the codebook`,
    ],
    [
      subject => Object.keys(registry[subject.entity]).includes(subject.type),
      subject => `"${subject.type}" definition not found in codebook["${subject.entity}"]`,
    ],
  );

  v.addValidationSequence('forms.*',
    [
      form => registry[form.entity],
      form => `form entity "${form.entity}" is not defined in codebook`,
    ],
    [
      form => (registry[form.entity][form.type] || !form.type),
      form => `"${form.type}" definition not found in codebook["${form.entity}"]`,
    ],
    [
      form =>
        form.fields.every(field => (form.type ?
          registry[form.entity][form.type].variables[field.variable] :
          registry[form.entity].variables[field.variable])),
      form => `Undefined form field variables in codebook: ${undefinedFormVariables(form, registry)}`,
    ],
  );

  v.addValidationSequence('filter.rules[]',
    [
      rule => entityDefFromRule(rule, registry),
      rule => `Rule option type "${rule.options.type}" is not defined in codebook`,
    ],
    [
      (rule) => {
        const variables = entityDefFromRule(rule, registry).variables;
        return variables && variables[rule.options.attribute];
      },
      rule => `"${rule.options.attribute}" is not a valid variable ID`,
    ],
  );

  v.addValidation('protocol.stages',
    stages => !duplicateId(stages),
    stages => `Stages contain duplicate ID "${duplicateId(stages)}"`,
  );

  v.addValidation('stages[].panels',
    panels => !duplicateId(panels),
    panels => `Panels contain duplicate ID "${duplicateId(panels)}"`,
  );

  v.addValidation('.rules',
    rules => !duplicateId(rules),
    rules => `Rules contain duplicate ID "${duplicateId(rules)}"`,
  );

  v.addValidation('stages[].prompts',
    prompts => !duplicateId(prompts),
    prompts => `Prompts contain duplicate ID "${duplicateId(prompts)}"`,
  );

  v.addValidation('stages[].items',
    items => !duplicateId(items),
    items => `Items contain duplicate ID "${duplicateId(items)}"`,
  );

  v.addValidation('codebook.*.*.variables',
    variableMap => !duplicateInArray(getVariableNames(variableMap)),
    variableMap => `Duplicate variable name "${duplicateInArray(getVariableNames(variableMap))}"`,
  );

  v.addValidation('prompts[].variable',
    (variable, subject) => getVariablesForSubject(registry, subject)[variable],
    (variable, subject) => `"${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].cardOptions.additionalProperties[].variable',
    (variable, subject) => getVariablesForSubject(registry, subject)[variable],
    (variable, subject) => `"${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].sortOptions.sortOrder[].property',
    (prop, subject) => getVariablesForSubject(registry, subject)[prop],
    (prop, subject) => `Sort order property "${prop}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].sortOptions.sortableProperties[].variable',
    (variable, subject) => getVariablesForSubject(registry, subject)[variable],
    (variable, subject) => `Sortable property "${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].layout.layoutVariable',
    (variable, subject) => getVariablesForSubject(registry, subject)[variable],
    (variable, subject) => `Layout variable "${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].additionalAttributes',
    (attrMap, subject) => Object.keys(attrMap).every(attr => (
      getVariablesForSubject(registry, subject)[attr]
    )),
    attrMap => `One or more sortable properties not defined in codebook: ${Object.keys(attrMap)}`,
  );

  v.runValidations();

  v.warnings.forEach(warning => console.error(warning)); // eslint-disable-line no-console

  return v.errors;
};

module.exports = validateLogic;
