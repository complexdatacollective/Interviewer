import { useRef, useCallback } from 'react';
import { clamp } from 'lodash';

const LAYOUT_SPACE = 1000;

const useViewport = (layoutSpace = LAYOUT_SPACE) => {
  const state = useRef({
    zoom: 4,
    center: { x: 0, y: 0 },
  });

  const zoomViewport = useCallback((factor = 1.5, absolute = false) => {
    if (absolute) {
      state.current.zoom = factor;
      return;
    }

    state.current.zoom *= factor;
  }, []);

  const moveViewport = useCallback((x = 0, y = 0, absolute = false) => {
    if (absolute) {
      state.current.center = {
        x: x * layoutSpace,
        y: y * layoutSpace,
      };
      return;
    }

    state.current.center = {
      x: state.current.center.x + (x * layoutSpace / state.current.zoom),
      y: state.current.center.y + (y * layoutSpace / state.current.zoom),
    };
  }, []);

  // Convert relative coordinates (0-1) into pixel coordinates for d3-force accounting for viewport
  // -1000 - -1000 space, 0,0 center
  const calculateLayoutCoords = useCallback(({ x, y }) => {
    const { center, zoom } = state.current;

    return {
      x: (((x - 0.5) / zoom) * layoutSpace) + center.x,
      y: (((y - 0.5) / zoom) * layoutSpace) + center.y,
    };
  }, []);

  // Calculate relative position accounting for viewport
  const calculateRelativeCoords = useCallback(({ x, y }) => {
    const { center, zoom } = state.current;

    return {
      x: clamp((((x - center.x) / layoutSpace) * zoom) + 0.5, 0, 1),
      y: clamp((((y - center.y) / layoutSpace) * zoom) + 0.5, 0, 1),
    };
  }, []);

  return {
    viewport: state,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
  };
};

export default useViewport;
