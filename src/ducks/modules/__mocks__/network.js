/* eslint-env jest */

import uuidv4 from '../../../utils/uuid';

const {
  actionTypes,
  actionCreators: networkActionCreators,
  entityPrimaryKeyProperty,
} = jest.requireActual('../network');

const reducer = jest.fn(() => ({
  nodes: [],
  edges: [],
  ego: {
    [entityPrimaryKeyProperty]: uuidv4(),
  },
}));

const actionCreators = {
  ...networkActionCreators,
  batchAddNodes: jest.fn(networkActionCreators.batchAddNodes),
};

export default reducer;

export {
  actionTypes,
  actionCreators,
};
