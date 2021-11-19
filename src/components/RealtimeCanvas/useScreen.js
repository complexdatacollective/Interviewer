import { useRef, useCallback } from 'react';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const useScreen = () => {
  const state = useRef({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const initialize = useCallback((el) => {
    state.current = getAbsoluteBoundingRect(el);
  }, []);

  // Convert a relative coordinate into position on the screen accounting for viewport
  const calculateScreenCoords = useCallback(({ x, y } = { x: 0.5, y: 0.5 }) => {
    const { width, height } = state.current;

    return {
      x: (((x - 0.5) * width) + (0.5 * width)),
      y: (((y - 0.5) * height) + (0.5 * height)),
    };
  }, []);

  // Given a position on the screen calculate the relative coordinate for the viewport
  const calculateRelativeCoords = useCallback(({ x, y } = { x: 0, y: 0 }) => {
    const {
      width,
      height,
      left: viewportX,
      top: viewportY,
    } = state.current;

    return {
      x: (x - viewportX) / width,
      y: (y - viewportY) / height,
    };
  }, []);

  return {
    initialize,
    calculateScreenCoords,
    calculateRelativeCoords,
  };
};

export default useScreen;
