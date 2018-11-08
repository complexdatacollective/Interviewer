/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import { times } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';
import { getNodeWithIdAttributes, nodeAttributesProperty } from './network';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const generateNodes = (variableDefs, typeKey, howMany = 0) =>
  (dispatch) => {
    const mockNodes = times(howMany, () => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const age = faker.random.number({ min: 16, max: 99 });

      return getNodeWithIdAttributes({
        type: typeKey,
        promptId: 'mock',
        stageId: 'mock',
        [nodeAttributesProperty]: {
          name: `${firstName} ${lastName}`,
          nickname: lastName,
          age,
        },
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
