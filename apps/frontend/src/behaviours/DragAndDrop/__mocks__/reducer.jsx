/* eslint-env jest */

const upsertTarget = jest.fn(() => ({ type: null }));
const renameTarget = jest.fn(() => ({ type: null }));
const removeTarget = jest.fn(() => ({ type: null }));

const upsertObstacle = jest.fn(() => ({ type: null }));
const removeObstacle = jest.fn(() => ({ type: null }));

const dragStart = jest.fn(() => ({ type: null }));
const dragMove = jest.fn(() => ({ type: null }));
const dragEnd = jest.fn(() => ({ type: null }));

const actionCreators = {
  upsertTarget,
  renameTarget,
  removeTarget,
  upsertObstacle,
  removeObstacle,
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
