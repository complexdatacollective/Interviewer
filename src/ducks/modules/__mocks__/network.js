/* eslint-env jest */

const reducer = jest.requireActual('../network').default;
const {
  actionTypes,
  actionCreators: networkActionCreators,
} = jest.requireActual('../network');

const actionCreators = {
  ...networkActionCreators,
  batchAddNodes: jest.fn(networkActionCreators.batchAddNodes),
};

export default reducer;

export {
  actionTypes,
  actionCreators,
};
