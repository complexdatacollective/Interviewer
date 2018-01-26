/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import { times } from 'lodash';
import { actionCreators as networkActions } from './network';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const generateNodes = (howMany = 0) =>
  (dispatch) => {
    times(howMany, () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const age = faker.random.number({ min: 16, max: 99 });

      return dispatch(networkActions.addNode({
        type: 'person',
        promptId: 'mock',
        stageId: 'mock',
        name: `${firstName} ${lastName}`,
        nickname: lastName,
        age,
        timeCreated: Date.now().toString(),
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
