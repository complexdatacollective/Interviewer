import { useRef, useCallback } from 'react';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const useScreen = () => {
  const state = useRef({
    width: 0,
    height: 0,
  });

  const initialize = useCallback((el) => {
    state.current = getAbsoluteBoundingRect(el);
  }, []);

  // Convert a relative coordinate into position on the screen accounting for viewport
  const calculateScreenCoords = useCallback(({ x, y }) => {
    const { width, height } = state.current;

    return {
      x: (((x - 0.5) * width) + (0.5 * width)),
      y: (((y - 0.5) * height) + (0.5 * height)),
    };
  }, []);

  return {
    initialize,
    calculateScreenCoords,
  };
};

export default useScreen;
