/* eslint-env jest */

import uuidv4 from '../../../utils/uuid';

const { actionTypes, entityPrimaryKeyProperty } = jest.requireActual('../network');

const reducer = jest.fn(() => ({
  nodes: [],
  edges: [],
  ego: {
    [entityPrimaryKeyProperty]: uuidv4(),
  },
}));

export default reducer;

export {
  actionTypes,
};
