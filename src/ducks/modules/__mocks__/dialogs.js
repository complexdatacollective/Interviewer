import { vi } from 'vitest';

const openDialog = vi.fn();
const closeDialog = vi.fn();

const actionCreators = {
  openDialog,
  closeDialog,
};

const reducer = vi.fn((state = { dialogs: [] }) => state);

export { actionCreators };
export default reducer;
