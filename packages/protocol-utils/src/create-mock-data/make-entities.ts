import { edgeSourceProperty, edgeTargetProperty, VariableDefinition, NcEdge, NcEntity, NcNode, entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { has } from 'lodash';
import { v4 as uuid } from 'uuid';
import make from './make-mock-value.js';

export const makeEntity = (
  variables: Record<string, VariableDefinition> = {},
  promptAttributes: Record<string, VariableDefinition> = {},
): NcEntity => {
  const mockAttributes: Record<string, any> = {};

  for (const [uid, variable] of Object.entries(variables)) {
    if (has(promptAttributes, uid)) {
      break;
    }

    const mockVariable = make(variable);
    mockAttributes[uid] = mockVariable;
  }

  return {
    [entityPrimaryKeyProperty]: uuid(),
    [entityAttributesProperty]: {
      ...mockAttributes,
    },
  };
};

export const makeNode = (
  typeID: string,
  variables = {},
  promptAttributes = {},
): NcNode => {
  const entity = makeEntity(variables, promptAttributes);

  const modelData = {
    promptIDs: ['mock'], // eslint-disable-line @typescript-eslint/naming-convention
    stageId: 'mock', // Should pass in the protocol here and randomly assign stage IDs
    type: typeID,
  };

  return {
    ...entity,
    ...modelData,
  };
};

export const makeEdge = (
  typeID: string,
  from: string,
  to: string,
  variables: Record<string, VariableDefinition> = {},
  promptAttributes: Record<string, VariableDefinition> = {},
): NcEdge => { // eslint-disable-line max-params
  const entity = makeEntity(variables, promptAttributes);

  return {
    ...entity,
    type: typeID,
    [edgeSourceProperty]: from,
    [edgeTargetProperty]: to,
  };
};

export const makeEgo = makeEntity;
