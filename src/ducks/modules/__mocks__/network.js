import { vi } from 'vitest';

const reducer = await vi.importActual('../network').then(m => m.default);
const {
  actionTypes,
  actionCreators: networkActionCreators,
} = await vi.importActual('../network');

const actionCreators = {
  ...networkActionCreators,
  batchAddNodes: vi.fn(networkActionCreators.batchAddNodes),
};

export default reducer;

export {
  actionTypes,
  actionCreators,
};
