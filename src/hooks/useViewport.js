import { useCallback } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';
import { clamp } from 'lodash';

const LAYOUT_SPACE = 1000;

const useViewport = (layoutSpace = LAYOUT_SPACE) => {
  const zoom = useSpring(3);
  // Don't use spring for centering since this functionality isn't exposed in UI
  const centerX = useMotionValue(0);
  const centerY = useMotionValue(0);

  const getViewport = useCallback(() => ({
    zoom: zoom.get(),
    center: {
      x: centerX.get(),
      y: centerY.get(),
    },
  }), []);

  const zoomViewport = useCallback((factor = 1.5, absolute = false) => {
    if (absolute) {
      zoom.set(factor);
      return;
    }

    zoom.set(zoom.get() * factor);
  }, []);

  const moveViewport = useCallback((x = 0, y = 0, absolute = false) => {
    if (absolute) {
      centerX.set(x * layoutSpace);
      centerY.set(y * layoutSpace);
      return;
    }

    centerX.set(centerX.get() + (x * layoutSpace / zoom.get()));
    centerY.set(centerY.get() + (y * layoutSpace / zoom.get()));
  }, []);

  // Convert relative coordinates (0-1) into pixel coordinates for d3-force accounting for viewport
  // -1000 - -1000 space, 0,0 center
  const calculateLayoutCoords = useCallback(({ x, y }) => ({
    x: (((x - 0.5) / zoom.get()) * layoutSpace) + centerX.get(),
    y: (((y - 0.5) / zoom.get()) * layoutSpace) + centerY.get(),
  }), []);

  // Calculate relative position accounting for viewport
  const calculateRelativeCoords = useCallback(({ x, y }) => ({
    x: clamp((((x - centerX.get()) / layoutSpace) * zoom.get()) + 0.5, 0, 1),
    y: clamp((((y - centerY.get()) / layoutSpace) * zoom.get()) + 0.5, 0, 1),
  }), []);

  return {
    viewport: getViewport,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
  };
};

export default useViewport;
