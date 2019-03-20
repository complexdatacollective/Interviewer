// For some error types, AJV returns info separate from message
const additionalErrorInfo = (errorObj) => {
  const params = errorObj.params || {};
  return params.additionalProperty
    || params.allowedValues
    || params.allowedValue;
};

const errToString = (errorObj) => {
  if (typeof errorObj === 'string') {
    return errorObj;
  }
  let str = `${errorObj.dataPath} ${errorObj.message}`;
  const addlInfo = additionalErrorInfo(errorObj);
  if (addlInfo) {
    str += ` '${addlInfo}'`;
  }
  return `${str} \n\n`;
};

const undefinedFormVariables = (form, codebook) =>
  form.fields
    .map(f => f.variable)
    .filter(variable => !codebook[form.entity][form.type].variables[variable]);

const nodeVarsIncludeDisplayVar = node =>
  !node.displayVariable // displayVariable is optional
    || Object.keys(node.variables).some(variableId => variableId === node.displayVariable);

const entityDefFromRule = (rule, codebook) =>
  codebook[rule.type === 'edge' ? 'edge' : 'node'][rule.options.type];

const getVariablesForSubject = (registry, subject = {}) =>
  (
    registry[subject.entity] &&
    registry[subject.entity][subject.type] &&
    registry[subject.entity][subject.type].variables
  ) || {};

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

module.exports = {
  duplicateId,
  duplicateInArray,
  entityDefFromRule,
  errToString,
  getVariablesForSubject,
  getVariableNames,
  nodeVarsIncludeDisplayVar,
  undefinedFormVariables,
};
