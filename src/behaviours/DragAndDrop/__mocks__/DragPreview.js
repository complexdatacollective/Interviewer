/* eslint-env jest */

const position = jest.fn();
const cleanup = jest.fn();

const DragPreview = jest.fn(() => ({
  position,
  cleanup,
}));

export {
  position,
  cleanup,
};

export default DragPreview;
