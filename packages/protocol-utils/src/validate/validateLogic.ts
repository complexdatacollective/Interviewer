import { get, isArray, has, isObject } from 'lodash';
import Validator from './Validator.js';
import {
  duplicateId,
  duplicateInArray,
  entityDefFromRule,
  getVariablesForSubject,
  getVariableNames,
  getEntityNames,
  nodeVarsIncludeDisplayVar,
  getVariableNameFromID,
  getSubjectTypeName,
} from './helpers.js';
import { Codebook, NcNode, Protocol, Stage, StageSubject, FormField, VariableValidation, FilterRule, Prompt, ItemDefinition, VariableDefinition, AdditionalAttributes } from '@codaco/shared-consts';

/**
 * Define and run all dynamic validations (which aren't covered by the JSON Schema).
 *
 * @return {string[]} an array of failure messages from the validator
 */
const validateLogic = (protocol: Protocol) => {
  const v = new Validator(protocol);
  const codebook: Codebook = protocol.codebook;

  v.addValidation('codebook',
    (codebook: Codebook) => !duplicateInArray(getEntityNames(codebook)),
    (codebook: Codebook) => `Duplicate entity name "${duplicateInArray(getEntityNames(codebook))}"`,
  );

  v.addValidation('codebook.node.*',
    (nodeType: NcNode) => nodeVarsIncludeDisplayVar(nodeType),
    (nodeType: NcNode) => `node displayVariable "${nodeType.displayVariable}" did not match any node variable`);

  // Subject can either by an object, or a collection, depending on the stage.
  // Currently, sociogram is the only stage type allowing a collection.
  v.addValidationSequence('stages[].subject',
    [
      (subject: StageSubject, _: any, keypath: Array<string>) => {
        const stage: Stage = get(protocol, `${keypath[1]}${keypath[2]}`);
        return !(isArray(subject) && stage.type !== 'Sociogram');
      },
      () => 'Only the sociogram interface may use multiple node types',
    ],
    [
      (subject: StageSubject | StageSubject[]) => {
        if (isArray(subject)) {
          return !duplicateInArray(subject.map(getSubjectTypeName));
        }

        return true;
      },
      (subject: StageSubject[]) => `Duplicate subject type "${duplicateInArray(subject.map(getSubjectTypeName))}"`,
    ],
    [
      (subject: StageSubject) => {
        // Check all subject entities are defined in the codebook section for their type
        if (isArray(subject)) {
          return subject.every(s => has(codebook, `${s.entity}.${s.type}`));
        }

        return has(codebook, `${subject.entity}.${subject.type}`);
      },
      () => 'One or more subjects are not defined in the codebook',
    ],
  );

  // Tries to validate inline forms.
  // If the stage type is egoform, lookup variables in codebook[ego]
  // Otherwise, use stage.subject to get codebook reference
  v.addValidationSequence('stages[].form.fields[]',
    [
      (field: FormField, _subject: StageSubject, keypath: Array<string>) => {
        // We know that keypath will be in key order, with dedicated keys for array index.
        // Therefore: keypath[1] = 'stages', keypath[2] = [index]
        const stage = get(protocol, `${keypath[1]}${keypath[2]}`);
        let codebookEntity;

        if (stage.type === 'EgoForm') {
          codebookEntity = codebook.ego;
        } else {
          const stageSubject = stage.subject;
          const path = `codebook.${stageSubject.entity}.${stageSubject.type}`;

          codebookEntity = get(protocol, path);
        }

        const variable = field.variable;

        return codebookEntity.variables[variable];
      },
      () => 'Form field variable not found in codebook.',
    ],
  );

  // Variable validation...validation (:/)
  // Needs to:
  //   1. Check that any variables referenced by a validation exist in the codebook
  //   2. Check that validation is not applied on a variable that is on an inappropriate
  //      entity type.
  v.addValidation('codebook.ego.variables.*.validation',
    // First, check that unique is not applied on any ego variables
    (validation: VariableValidation) => !Object.keys(validation).includes('unique'),
    (_: any, __: any, keypath: Array<string>) => `The 'unique' variable validation cannot be used on ego variables. Was used on ego variable "${getVariableNameFromID(codebook, { entity: 'ego' }, keypath[4])}".`,
  );

  v.addValidation('codebook.*.*.variables.*.validation',
    // Next, check that differentFrom and sameAs reference variables that exist in the codebook
    // for the variable type
    (validations: VariableValidation, _: any, keypath: Array<string>) => {
      // List of validation types that reference variables
      const typesWithVariables = ['sameAs', 'differentFrom', 'greaterThanVariable', 'lessThanVariable'];

      // Get variable registryfor the current variable's entity type
      const path = `codebook.${keypath[2]}.${keypath[3]}.variables`;
      const variablesForType = get(protocol, path, {});

      // Filter validations to only those that reference variables
      const typesToCheck: Array<string> = Object.keys(validations).filter(
        validation => typesWithVariables.includes(validation),
      );

      // Check that every validation references a variable defined in the codebook
      return typesToCheck.every((type) => {
        const variable: string = get(validations, type);
        return Object.keys(variablesForType).includes(variable);
      });
    },
    (validation: VariableValidation, _: any, keypath: Array<string>) => {
      const subject = {
        entity: keypath[2],
        type: keypath[3],
      };
      return `Validation configuration for the variable "${getVariableNameFromID(codebook, subject, keypath[5])}" on the ${subject.entity} type "${getSubjectTypeName(codebook, subject)}" is invalid! The variable "${Object.values(validation)[0]}" referenced by the validation does not exist in the codebook for this type.`;
    },
  );


  v.addValidationSequence('filter.rules[]',
    [
      (rule: FilterRule) => entityDefFromRule(rule, codebook),
      (rule: FilterRule) => `Rule option type "${rule.options.type}" is not defined in codebook`,
    ],
    [
      (rule: FilterRule) => {
        if (!rule.options.attribute) { return true; } // Entity type rules do not have an attribute
        const variables = entityDefFromRule(rule, codebook).variables;
        return variables && variables[rule.options.attribute];
      },
      (rule: FilterRule) => `"${rule.options.attribute}" is not a valid variable ID`,
    ],
  );

  v.addValidation('protocol.stages',
    (stages: Stage[]) => !duplicateId(stages),
    (stages: Stage[]) => `Stages contain duplicate ID "${duplicateId(stages)}"`,
  );

  v.addValidation('stages[].panels',
    (panels: object[]) => !duplicateId(panels),
    (panels: object[]) => `Panels contain duplicate ID "${duplicateId(panels)}"`,
  );

  v.addValidation('.rules',
    (rules: FilterRule) => !duplicateId(rules),
    (rules: FilterRule) => `Rules contain duplicate ID "${duplicateId(rules)}"`,
  );

  v.addValidation('stages[].prompts',
    (prompts: Prompt[]) => !duplicateId(prompts),
    (prompts: Prompt[]) => `Prompts contain duplicate ID "${duplicateId(prompts)}"`,
  );

  v.addValidation('stages[].items',
    (items: ItemDefinition[]) => !duplicateId(items),
    (items: ItemDefinition[]) => `Items contain duplicate ID "${duplicateId(items)}"`,
  );

  v.addValidation('codebook.*.*.variables',
    (variableMap: Record<string, VariableDefinition>) => !duplicateInArray(getVariableNames(variableMap)),
    (variableMap: Record<string, VariableDefinition>) => `Duplicate variable name "${duplicateInArray(getVariableNames(variableMap))}"`,
  );

  // Ordinal and categorical bin interfaces have a variable property on the prompt.
  // Check this variable exists in the stage subject codebook
  v.addValidation('prompts[].variable',
    (variable: string, subject: StageSubject) => getVariablesForSubject(codebook, subject)[variable],
    (variable: string, subject: StageSubject) => `"${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  // 'otherVariable' is used by categorical bin for 'other' responses. Check this variable
  // exists in the stage subject codebook
  v.addValidation('prompts[].otherVariable',
    (otherVariable: string, subject: StageSubject) => getVariablesForSubject(codebook, subject)[otherVariable],
    (otherVariable: string, subject: StageSubject) => `"${otherVariable}" not defined in codebook[${subject.entity}][${subject.type}].variables`,
  );

  // Sociogram and TieStrengthCensus use createEdge to know which edge type to create.
  // Check this edge type exists in the edge codebook
  v.addValidation('prompts[].createEdge',
    (createEdge: string) => {
      if (!codebook.edge) { return false; }
      return Object.keys(codebook.edge).includes(createEdge);
    },
    (createEdge: string) => `"${createEdge}" definition for createEdge not found in codebook["edge"]`,
  );

  // TieStrengthCensus uses edgeVariable to indicate which ordinal variable should be used to
  // provide the strength options.
  // Check that it exists on the edge type specified by createEdge, and that its type is ordinal.
  v.addValidationSequence('prompts[].edgeVariable',
    [
      (edgeVariable: string, _: any, keypath: Array<string>) => {
        // Keypath = [ 'protocol', 'stages', '[{stageIndex}]', 'prompts', '[{promptIndex}]', 'edgeVariable' ]
        const path = `stages.${keypath[2]}.prompts${keypath[4]}.createEdge`;
        const createEdgeForPrompt = get(protocol, path);
        return getVariablesForSubject(codebook, { entity: 'edge', type: createEdgeForPrompt })[edgeVariable];
      },
      (edgeVariable: string, _: any, keypath: Array<string>) => {
        const path = `stages.${keypath[2]}.prompts${keypath[4]}.createEdge`;
        const createEdgeForPrompt = get(protocol, path);
        return `"${edgeVariable}" not defined in codebook[edge][${createEdgeForPrompt}].variables`;
      },
    ],
    [
      (edgeVariable: string, _: any, keypath: Array<string>) => {
        // Keypath = [ 'protocol', 'stages', '[{stageIndex}]', 'prompts', '[{promptIndex}]', 'edgeVariable' ]
        const path = `stages.${keypath[2]}.prompts${keypath[4]}.createEdge`;
        const createEdgeForPrompt = get(protocol, path);
        const codebookEdgeVariable = getVariablesForSubject(codebook, { entity: 'edge', type: createEdgeForPrompt })[edgeVariable];

        return codebookEdgeVariable.type === 'ordinal';
      },
      (edgeVariable: string) => `"${edgeVariable}" is not of type 'ordinal'.`,
    ],
  );

  // layoutVariable can either be a string, or an object where the key is a node type and the value
  // is a variable ID.
  v.addValidation('prompts[].layout.layoutVariable',
    (variable: string, subject: StageSubject) => {
      if (isObject(variable)) {
        return Object.keys(variable).every(nodeType => getVariablesForSubject(codebook, { entity: 'node', type: nodeType })[variable[nodeType]]);
      }

      return getVariablesForSubject(codebook, subject)[variable];
    },
    (variable: string, subject: StageSubject) => {
      if (isObject(variable)) {
        const missing = Object.keys(variable).filter(nodeType => !getVariablesForSubject(codebook, { entity: 'node', type: nodeType })[variable[nodeType]]);
        return missing.map(nodeType => `Layout variable "${variable[nodeType]}" not defined in codebook[node][${nodeType}].variables.`).join(' ');
      }

      return `Layout variable "${variable}" not defined in codebook[${subject.entity}][${subject.type}].variables.`;
    },
  );

  v.addValidation('prompts[].additionalAttributes',
    (additionalAttributes: AdditionalAttributes, subject: StageSubject) => additionalAttributes.every(
      ({ variable }) => getVariablesForSubject(codebook, subject)[variable],
    ),
    (additionalAttributes: AdditionalAttributes) => `One or more sortable properties not defined in codebook: ${additionalAttributes.map(({ variable }) => variable)}`,
  );

  // Sociogram prompt edges key can contain a restrict object.

  // If restrict.origin is present, its value must be a valid node type.
  v.addValidation('prompts[].edges.restrict.origin',
    (origin: string) => {
      if (!origin || !codebook.node) { return false; }
      return Object.keys(codebook.node).includes(origin);
    },
    (origin: string) => `"${origin}" is not a valid node type.`,
  );

  v.runValidations();

  v.warnings.forEach(warning => console.error(warning)); // eslint-disable-line no-console

  return v.errors;
};

export default validateLogic;
