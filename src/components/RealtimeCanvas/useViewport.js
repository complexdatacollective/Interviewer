import { useRef, useCallback } from 'react';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

// -1000 - 1000 space, 0,0 center
const LAYOUT_SPACE = 2000;

const useViewport = () => {
  const state = useRef({
    zoom: 1,
    center: { x: 0.5, y: 0.5 },
    screen: { width: 0, height: 0 },
  });

  const measureScreen = useCallback((el) => {
    state.current.screen = getAbsoluteBoundingRect(el);
    console.log({ screen: state.current.screen });
  });

  const zoomViewport = useCallback((factor = 1.5) => {
    state.current.zoom *= factor;
  });

  const moveViewport = useCallback((x = 0, y = 0) => {
    state.current.center = {
      x: state.current.center.x + (x / state.current.zoom),
      y: state.current.center.y + (y / state.current.zoom),
    };
  });

  // -1000 - -1000 space, 0,0 center
  const calculateLayoutCoords = useCallback(({ x, y }) => ({
    x: (x - 0.5) * LAYOUT_SPACE,
    y: (y - 0.5) * LAYOUT_SPACE,
  }));

  const calculateRelativeCoords = useCallback(({ x, y }) => ({
    x: (x / LAYOUT_SPACE) + 0.5,
    y: (y / LAYOUT_SPACE) + 0.5,
  }));

  // takes a relative coord
  const calculateScreenCoords = useCallback(({ x, y }) => {
    const { center, screen: { width, height }, zoom } = state.current;

    return {
      x: ((x - center.x) * width * zoom) + (0.5 * width),
      y: ((y - center.y) * height * zoom) + (0.5 * height),
    };
  });

  return [
    state,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    calculateScreenCoords,
    measureScreen,
  ];
};

export default useViewport;
