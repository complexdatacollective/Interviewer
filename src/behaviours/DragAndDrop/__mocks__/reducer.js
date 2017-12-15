/* eslint-env jest */

const updateTarget = jest.fn(() => ({ type: null }));
const renameTarget = jest.fn(() => ({ type: null }));
const removeTarget = jest.fn(() => ({ type: null }));

const dragStart = jest.fn(() => ({ type: null }));
const dragMove = jest.fn(() => ({ type: null }));
const dragEnd = jest.fn(() => ({ type: null }));

const actionCreators = {
  updateTarget,
  renameTarget,
  removeTarget,
  dragStart,
  dragMove,
  dragEnd,
};

const reducer = jest.fn();

export {
  actionCreators,
  reducer,
};

export default reducer;
