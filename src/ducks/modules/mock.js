/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import { times } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';
import { getNodeWithIdAttributes, nodeAttributesProperty } from './network';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const mockCoord = () => faker.random.number({ min: 0, max: 1, precision: 0.000001 });

const mockValue = (nodeVariable) => {
  switch (nodeVariable.type) {
    case 'boolean':
      return faker.random.boolean();
    case 'number':
      return faker.random.number({ min: 20, max: 100 });
    case 'ordinal':
      return faker.random.arrayElement(nodeVariable.options);
    case 'layout':
      return { x: mockCoord(), y: mockCoord() };
    default: return faker.random.word();
  }
};

// TODO: ignore additionalAttributes?
const generateNodes = (variableDefs, typeKey, howMany = 0) =>
  (dispatch) => {
    const mockNodes = times(howMany, () => {
      const mockAttrs = Object.entries(variableDefs).reduce((acc, [variableId, variable]) => {
        acc[variableId] = mockValue(variable);
        return acc;
      }, {});

      return getNodeWithIdAttributes({
        type: typeKey,
        promptId: 'mock',
        stageId: 'mock',
        [nodeAttributesProperty]: mockAttrs,
      }, variableDefs);
    });

    return dispatch(sessionsActions.addNodes(mockNodes));
  };

const actionCreators = {
  generateNodes,
};

const actionTypes = {
  MOCK_GENERATE_NODES,
};

export {
  actionCreators,
  actionTypes,
};
