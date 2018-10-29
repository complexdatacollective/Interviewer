/* eslint-env node */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { pull, without } = require('lodash');
const {
  main: quicktypeCli,
} = require('quicktype');

const projectDir = path.join(__dirname, '..', '..');
const outputDir = path.join(projectDir, 'schema'); // TODO: unignore

const input = path.join(projectDir, 'public', 'protocols', 'development.netcanvas', 'protocol.json');
const devProtocol = JSON.parse(fs.readFileSync(input));
const protocol = { ...devProtocol };

const protocolFile = path.join(outputDir, 'abstract-protocol.json');
const schemaFile = path.join(outputDir, 'protocol.schema');

const ensureOutputDir = () => {
  try {
    fs.mkdirSync(outputDir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
};

/**
 * Build a generic/abstract protocol based on one of the factory protocols.
 * Schema keys are derived from prop names in this example protocol, so they're kept descriptive.
 *
 * Notes:
 * - 'required' is derived from example data; if only some of multiple examples contain value,
 *   then the key is considered optional.
 */
const generateAbstractProtocol = () => {
  // See https://github.com/codaco/Network-Canvas/wiki/protocol.json#variable-registry
  const variable = {
    label: '', // A human readable short label for this variable.
    description: '', // A human readable description for this variable
    type: '', // A valid variable type. For types, see below.
    validation: {
      // See https://github.com/codaco/Architect/blob/v4.0.0-alpha.4/src/utils/validations.js
      required: true,
      requiredAcceptsNull: true,
      minLength: 1,
      maxLength: 24,
      minValue: 0,
      maxValue: 10,
      minSelected: 1,
      maxSelected: 10,
    }, // Validation rules, using redux-form compatible syntax.
    options: [{ label: '1', value: '1' }],
  };

  // From the VR, keep only the one definition for node & edge
  // Referenced dynamically to support Network-Canvas#648
  const vr = protocol.variableRegistry;
  vr.node = { nodeTypeDef: { ...Object.values(vr.node)[0] } };
  vr.node.nodeTypeDef.variables = { variable };
  vr.edge = { edgeTypeDef: { ...Object.values(vr.edge)[0] } };
  vr.edge.edgeTypeDef.variables = { variable };

  protocol.forms = { form: { ...Object.values(protocol.forms)[0] } };

  // external data has no specified stucture
  protocol.externalData = {};

  fs.writeFileSync(protocolFile, JSON.stringify(protocol, null, 2));

  console.log('Created protocol', protocolFile);
};

/**
 * Create a JSON schema based on the abstract protocol.
 * Begin with auto-generation, and modify resulting JSON as needed
 * rather than depending on quicktype internals or IR.
 */
const generateSchema = async () => {
  // Write default based on abstract example protocol
  await quicktypeCli(['--telemetry=disable', '-o', schemaFile, protocolFile]);

  const schema = JSON.parse(fs.readFileSync(schemaFile));
  const defs = schema.definitions;

  defs.Protocol.required = ['name', 'stages', 'variableRegistry'];
  defs.Protocol.properties.stages.minItems = 1;
  defs.Protocol.properties.lastModified.format = 'date-time';

  const stageTypeEnum = ['NameGenerator', 'NameGeneratorList', 'NameGeneratorAutoComplete', 'Sociogram', 'Information', 'OrdinalBin'];
  defs.Stage.title = 'Interface';
  defs.Stage.properties.type.enum = stageTypeEnum;
  defs.Stage.properties.prompts.minItems = 1;
  defs.Stage.anyOf = [
    {
      properties: { type: { const: 'Information' } },
      required: [...defs.Stage.required, 'items'],
    },
    {
      properties: { type: { enum: without(stageTypeEnum, 'Information') } },
      required: [...defs.Stage.required, 'prompts'],
    },
  ];

  // AdditionalAttributes & ExternalData have no defined props and may contain anything
  delete defs.AdditionalAttributes.properties;
  delete defs.AdditionalAttributes.additionalProperties;
  delete defs.ExternalData.properties;
  delete defs.ExternalData.additionalProperties;

  defs.VariableRegistry.required = [];

  // Node: `variableRegistry.node`
  // May contain props of any name; each prop references a NodeTypeDef
  defs.Node.patternProperties = { '.+': defs.Node.properties.nodeTypeDef };
  delete defs.Node.properties;
  delete defs.Node.required;

  // NodeTypeDef: `variableRegistry.node[NODE_TYPE]`
  delete defs.NodeTypeDef.required; // TODO: is this true?

  // See comments on Node, above
  defs.Edge.patternProperties = { '.+': { properties: defs.Edge.properties } };
  delete defs.Edge.properties;
  delete defs.Edge.required;

  pull(defs.Edges.required, 'create');

  // Variables: one of `variableRegistry.node[NODE_TYPE].variables[VARIABLE_NAME]`
  // Used for both nodes & edges
  defs.Variables.patternProperties = { '.+': { properties: defs.Variables.properties } };
  delete defs.Variables.properties;
  delete defs.Variables.required;

  // Variable Type must be one of the valid types, and is the only required field
  // https://github.com/codaco/Network-Canvas/wiki/Variable-Types
  defs.Variable.required = ['type'];
  defs.Variable.properties.type.enum = [
    'text', 'number', 'datetime', 'boolean', 'ordinal', 'categorical', 'layout', 'location',
  ];

  // Forms: like variableRegistry, an object with arbitrary keys and well-defined values
  defs.Forms.patternProperties = { '.+': { properties: defs.Forms.properties } };
  delete defs.Forms.properties;
  delete defs.Forms.required;

  // subject.entity
  defs.Entity.enum = ['node', 'edge'];

  // All validations are optional
  delete defs.Validation.required;

  // SkipLogic & Filter rules
  defs.SkipLogic.properties.value.minimum = 1;
  defs.SkipLogic.properties.value.multipleOf = 1;
  defs.SkipLogic.properties.action.enum = ['SHOW', 'SKIP'];
  defs.SkipLogic.properties.operator.enum = ['ANY', 'NONE', 'EXACTLY', 'NOT', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL'];
  defs.SkipLogic.allOf = [
    {
      if: { properties: { operator: { enum: ['ANY', 'NONE'] } } },
      then: { required: without(defs.SkipLogic.required, 'value') },
    },
  ];

  defs.Filter.properties.join.enum = ['OR', 'AND'];

  defs.Rule.type.enum = ['alter', 'ego', 'edge'];

  const filterOptionsEnum = ['EXISTS', 'NOT_EXISTS', 'EXACTLY', 'NOT', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL'];
  defs.Options.properties.operator.enum = filterOptionsEnum;
  defs.Options.allOf = [
    {
      if: { properties: { operator: { enum: without(filterOptionsEnum, 'EXISTS', 'NOT_EXISTS') } } },
      then: { required: [...defs.Options.required, 'value'] },
    },
  ];

  // Most props are treated by NC as optional; this will
  // need actual review...
  pull(defs.Item.required, 'size');
  pull(defs.Highlight.required, 'allowHighlighting');

  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));

  console.log('Created schema', schemaFile);
};

ensureOutputDir();
generateAbstractProtocol();
generateSchema();
