/**
 * Migration from v3 to v4
 */

const setProps = (props, source = {}) =>
  Object.keys(props)
    .reduce((acc, key) => {
      if (!source[key]) { return acc; }
      return { ...acc, [key]: props[key] };
    }, source);

const getNextSafeValue = (value, existing, inc = 1) => {
  const incrementedValue = inc > 1 ? `${value}${inc}` : value;
  if (!existing.includes(incrementedValue)) { return incrementedValue; }

  return getNextSafeValue(value, existing, inc + 1);
};

const getSafeValue = (value, existing = []) => {
  if (typeof value !== 'string') { return value; } // some option values are numeric

  const safeValue = value.replace(/[\s]+/g, '_').replace(/[^a-zA-Z0-9._:-]+/g, '');

  return getNextSafeValue(safeValue, existing);
};

const getNames = (obj = {}) =>
  Object.keys(obj)
    .map(key => obj[key].name);

const migrateOptionValues = (options = []) =>
  options.reduce((acc, { value, ...rest }) => ([
    ...acc,
    { ...rest, value: getSafeValue(value, acc.map(o => o.value)) },
  ]), []);

const migrateVariable = (variable = {}, acc = {}) => setProps({
  options: migrateOptionValues(variable.options),
  name: getSafeValue(variable.name, getNames(acc)),
}, variable);

const migrateVariables = (variables = {}) =>
  Object.keys(variables)
    .reduce((acc, variableId) => ({
      ...acc,
      [variableId]: migrateVariable(variables[variableId], acc),
    }), {});

const migrateType = (type = {}, acc = {}) => setProps({
  name: getSafeValue(type.name, getNames(acc)),
  variables: migrateVariables(type.variables),
}, type);

const migrateTypes = (types = {}) =>
  Object.keys(types)
    .reduce((acc, typeId) => ({
      ...acc,
      [typeId]: migrateType(types[typeId], acc),
    }), {});

const migratePrompt = (prompt = {}) => {
  const booleanOnlyAttributes = prompt.additionalAttributes.filter(additionalAttribute =>
    additionalAttribute.value === true || additionalAttribute.value === false);
  return Object.keys(prompt).reduce((object, key) => {
    if (key !== 'additionalAttributes') {
      object[key] = prompt[key];
    } else if (booleanOnlyAttributes.length > 0) {
      object[key] = booleanOnlyAttributes;
    }
    return object;
  }, {});
};

const migrateStage = (stage = {}) => ({
  ...stage,
  prompts: stage.prompts.map(prompt =>
    prompt.additionalAttributes ? migratePrompt(prompt) : prompt),
});

const migrateStages = (stages = []) => stages.map(stage =>
  stage.prompts ? migrateStage(stage) : stage,
);

const migration = (protocol) => {
  const codebook = protocol.codebook;
  const stages = protocol.stages;

  const newCodebook = setProps({
    node: migrateTypes(codebook.node),
    edge: migrateTypes(codebook.edge),
    ego: migrateType(codebook.ego),
  }, codebook);

  const newStages = migrateStages(stages);

  return {
    ...protocol,
    codebook: newCodebook,
    stages: newStages,
  };
};

// Markdown format
const notes = `
- Automatically rename **variable names** and **ordinal/categorical values** to meet stricter requirements. Only letters, numbers, and the symbols \`.\`, \`_\`, \`-\`, \`:\` will be permitted. Spaces will be replaced with underscore characters (\`_\`), and any other symbols will be removed. Variables that meet these requirements already **will not be modified**.
- Add a numerical suffix (\`variable1\`, \`variable2\`, etc.) to any variables or categorical/ordinal values that clash as a result of these changes.
- Rename node and edge types to ensure they are unique, and conform to the same requirements as variable names. Names that clash will get a numerical suffix, as above.
- **NOTE:** If you are using external network data, you must ensure that you update your column headings manually to meet the same requirements regarding variable names outlined above. See our revised [documentation on variable naming](https://documentation.networkcanvas.com/reference/variable-naming/).
- Remove any non-boolean 'additional variables' from prompts. It was necessary to simplify this feature, and so only boolean variable types will be supported moving forwards. Any non-boolean variables you created that will be removed by this migration will remain in your codebook, but will be marked 'unused'. You should review and remove these manually, or replace them with equivalent boolean variables.`;

const v4 = {
  version: 4,
  notes,
  migration,
};

export default v4;
