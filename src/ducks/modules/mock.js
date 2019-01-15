/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import { has, times } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const mockCoord = () => faker.random.number({ min: 0, max: 1, precision: 0.000001 });


// Todo: make these mock values reflect validation
const mockValue = (nodeVariable) => {
  switch (nodeVariable.type) {
    case 'boolean':
      return faker.random.boolean();
    case 'number':
      return faker.random.number({ min: 20, max: 100 });
    case 'ordinal':
      return faker.random.arrayElement(nodeVariable.options).value;
    case 'categorical':
      return [faker.random.arrayElement(nodeVariable.options).value];
    case 'layout':
      return { x: mockCoord(), y: mockCoord() };
    default:
      return faker.random.word();
  }
};

const generateNodes = (variableDefs, typeKey, howMany = 0, additionalAttributes = {}) =>
  dispatch =>
    times(howMany, () => {
      const mockAttributes = Object.entries(variableDefs).reduce(
        (acc, [variableId, variable]) => {
          if (!has(additionalAttributes, variableId)) {
            acc[variableId] = mockValue(variable);
          }
          return acc;
        }, {},
      );

      const modelData = {
        promptIDs: ['mock'],
        stageId: 'mock',
        type: typeKey,
      };

      dispatch(sessionsActions.addNode(modelData, mockAttributes));
    });

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
