import { vi } from 'vitest';

const position = vi.fn();
const cleanup = vi.fn();

// Use a constructor function so it can be called with `new`
function DragPreview() {
  return {
    position,
    cleanup,
  };
}

// Make it a mock so we can track calls and use mockClear
const MockedDragPreview = vi.fn(DragPreview);

export {
  position,
  cleanup,
};

export default MockedDragPreview;
