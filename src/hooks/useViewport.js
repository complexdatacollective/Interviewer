import { useRef, useCallback } from 'react';
import { clamp } from 'lodash';

const LAYOUT_SPACE = 2000;

const useViewport = (layoutSpace = LAYOUT_SPACE) => {
  const state = useRef({
    zoom: 1,
    center: { x: 0.5, y: 0.5 },
  });

  const zoomViewport = useCallback((factor = 1.5) => {
    state.current.zoom *= factor;
  }, []);

  const moveViewport = useCallback((x = 0, y = 0) => {
    state.current.center = {
      x: state.current.center.x + (x / state.current.zoom),
      y: state.current.center.y + (y / state.current.zoom),
    };
  }, []);

  // Convert relative coordinates (0-1) into pixel coordinates for d3-force accounting for viewport
  // -1000 - -1000 space, 0,0 center
  const calculateLayoutCoords = useCallback(({ x, y }) => {
    const { center, zoom } = state.current;

    return {
      x: (((x - 0.5) / zoom) + center.x) * layoutSpace,
      y: (((y - 0.5) / zoom) + center.y) * layoutSpace,
    };
  }, []);

  // Calculate relative position accounting for viewport
  const calculateRelativeCoords = useCallback(({ x, y }) => {
    const { center, zoom } = state.current;

    return {
      x: clamp((((x / layoutSpace) - center.x) * zoom) + 0.5, 0, 1),
      y: clamp((((y / layoutSpace) - center.y) * zoom) + 0.5, 0, 1),
    };
  }, []);

  return [
    state,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
  ];
};

export default useViewport;
