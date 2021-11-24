import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

// TODO: watch resize

const screen = () => {
  const state = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  };

  const initialize = (el) => {
    const {
      width,
      height,
      left,
      top,
    } = getAbsoluteBoundingRect(el);
    state.width = width;
    state.height = height;
    state.left = left;
    state.top = top;
  };

  // Convert a relative coordinate into position on the screen accounting for viewport
  const calculateScreenCoords = ({ x, y } = { x: 0.5, y: 0.5 }) => {
    const { width, height } = state;

    return {
      x: (((x - 0.5) * width) + (0.5 * width)),
      y: (((y - 0.5) * height) + (0.5 * height)),
    };
  };

  // Given a position on the screen calculate the relative coordinate for the viewport
  const calculateRelativeCoords = ({ x, y } = { x: 0, y: 0 }) => {
    const {
      width,
      height,
      left: viewportX,
      top: viewportY,
    } = state;

    return {
      x: (x - viewportX) / width,
      y: (y - viewportY) / height,
    };
  };

  return {
    initialize,
    calculateScreenCoords,
    calculateRelativeCoords,
  };
};

export default screen;
