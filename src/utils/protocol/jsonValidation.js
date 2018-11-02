const Validator = require('./Validator');

const undefinedFormVariables = (form, variableRegistry) =>
  form.fields
    .map(f => f.variable)
    .filter(variable => !variableRegistry[form.entity][form.type].variables[variable]);

const nodeVarsIncludeDisplayVar = node =>
  !node.displayVariable // displayVariable is optional
    || Object.keys(node.variables).some(variableId => variableId === node.displayVariable);

const entityDefFromRule = (rule, variableRegistry) =>
  variableRegistry[rule.type === 'edge' ? 'edge' : 'node'][rule.options.type];

const getVariableNames = registryVars => Object.values(registryVars).map(vari => vari.name);

// @return the ID (or other unique prop) which is a duplicate, undefined otherwise
const duplicateId = (elements, uniqueProp = 'id') => {
  const map = {};
  const dupe = elements.find((el) => {
    if (map[el[uniqueProp]]) {
      return true;
    }
    map[el[uniqueProp]] = 1;
    return false;
  });
  return dupe && dupe[uniqueProp];
};

// @return the item which is a duplicate, undefined otherwise
const duplicateInArray = (items) => {
  const set = new Set();
  const dupe = items.find((item) => {
    if (set.has(item)) {
      return true;
    }
    set.add(item);
    return false;
  });
  return dupe;
};

/**
 * Define and run all dynamic validations (which aren't covered by the JSON Schema).
 *
 * @return {string[]} an array of failure messages from the validator
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
      form => `form entity "${form.entity}" is not defined in variableRegistry`,
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

  v.addValidationSequence('filter.rules[]',
    [
      rule => entityDefFromRule(rule, registry),
      rule => `Rule option type "${rule.options.type}" is not defined in variableRegistry`,
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

  v.addValidation('variableRegistry.*.*.variables',
    variableMap => !duplicateInArray(getVariableNames(variableMap)),
    variableMap => `Duplicate variable name "${duplicateInArray(getVariableNames(variableMap))}"`,
  );

  v.addValidation('prompts[].variable',
    (variable, subject) => registry[subject.entity][subject.type].variables[variable],
    (variable, subject) => `"${variable}" not defined in variableRegistry[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].cardOptions.additionalProperties[].variable',
    (variable, subject) => registry[subject.entity][subject.type].variables[variable],
    (variable, subject) => `"${variable}" not defined in variableRegistry[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].sortOptions.sortOrder[].property',
    (prop, subject) => registry[subject.entity][subject.type].variables[prop],
    (prop, subject) => `Sort order property "${prop}" not defined in variableRegistry[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].sortOptions.sortableProperties[].variable',
    (variable, subject) => registry[subject.entity][subject.type].variables[variable],
    (variable, subject) => `Sortable property "${variable}" not defined in variableRegistry[${subject.entity}][${subject.type}].variables`,
  );

  v.addValidation('prompts[].additionalAttributes',
    (attrMap, subject) => Object.keys(attrMap).every(attr =>
      registry[subject.entity][subject.type].variables[attr],
    ),
    attrMap => `One or more sortable properties not defined in variableRegistry: ${Object.keys(attrMap)}`,
  );

  v.runValidations();

  v.warnings.forEach(warning => console.error(warning)); // eslint-disable-line no-console

  return v.errors;
};

module.exports = {
  validateProtocol,
};
