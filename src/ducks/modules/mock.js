/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import { times } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';
import { nodeAttributesProperty } from './network';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const keyForVarName = (vars, name) => {
  const entry = Object.entries(vars).find(([, val]) => val.name === name);
  return entry && entry[0];
};

const generateNodes = (variableDefs, typeKey, howMany = 0) =>
  (dispatch) => {
    times(howMany, () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const age = faker.random.number({ min: 16, max: 99 });

      return dispatch(sessionsActions.addNodes({
        type: typeKey,
        promptId: 'mock',
        stageId: 'mock',
        [nodeAttributesProperty]: {
          [keyForVarName(variableDefs, 'name')]: `${firstName} ${lastName}`,
          [keyForVarName(variableDefs, 'nickname')]: lastName,
          [keyForVarName(variableDefs, 'age')]: age,
        },
      }));
    });
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
