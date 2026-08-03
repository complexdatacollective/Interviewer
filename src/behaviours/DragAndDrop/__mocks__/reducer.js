import { vi } from 'vitest';

const upsertTarget = vi.fn(() => ({ type: null }));
const renameTarget = vi.fn(() => ({ type: null }));
const removeTarget = vi.fn(() => ({ type: null }));

const upsertObstacle = vi.fn(() => ({ type: null }));
const removeObstacle = vi.fn(() => ({ type: null }));

const dragStart = vi.fn(() => ({ type: null }));
const dragMove = vi.fn(() => ({ type: null }));
const dragEnd = vi.fn(() => ({ type: null }));

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

const reducer = vi.fn();

export { actionCreators, reducer };

export default reducer;
