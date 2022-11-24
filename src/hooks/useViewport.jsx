import { useCallback } from 'react';
import { useMotionValue } from 'framer-motion';
import {
  clamp, max, min,
} from 'lodash';
import { get } from '../utils/lodash-replacements';

const LAYOUT_SPACE = 1000;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const suggestZoom = (nodes, layoutSpace = LAYOUT_SPACE, screen) => {
  if (nodes.length <= 1) {
    return 1;
  }

  const nodeSize = 65; // pixels
  const availableSpace = max([screen.width, screen.height]);
  const zoomArea = 1 - (nodeSize / availableSpace);

  const bound = nodes.reduce((acc, { x, y }, index) => {
    if (index === 0) {
      return max([Math.abs(x), Math.abs(y)]);
    }

    return max([Math.abs(x), Math.abs(y), acc]);
  }, 0);

  const suggestedZoom = (0.5 * zoomArea * layoutSpace) / bound;

  return min([MAX_ZOOM, max([MIN_ZOOM, suggestedZoom])]);
};

const useViewport = (layoutSpace = LAYOUT_SPACE) => {
  const zoom = useMotionValue(3);
  // Don't use spring for centering since this functionality isn't exposed in UI
  const centerX = useMotionValue(0);
  const centerY = useMotionValue(0);

  const viewport = {
    layoutSpace,
    zoom,
    center: {
      x: centerX,
      y: centerY,
    },
  };

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
  const calculateLayoutCoords = useCallback((coords) => {
    // Nodes may have no layoutVariable value, so start with 0.5
    const x = get(coords, 'x', 0.5);
    const y = get(coords, 'y', 0.5);

    return {
      x: (((x - 0.5) / zoom.get()) * layoutSpace) + centerX.get(),
      y: (((y - 0.5) / zoom.get()) * layoutSpace) + centerY.get(),
    };
  }, []);

  // Calculate relative position accounting for viewport
  const calculateRelativeCoords = useCallback(({ x, y }) => ({
    x: clamp((((x - centerX.get()) / layoutSpace) * zoom.get()) + 0.5, 0, 1),
    y: clamp((((y - centerY.get()) / layoutSpace) * zoom.get()) + 0.5, 0, 1),
  }), []);

  // Calculate relative position accounting for viewport
  const autoZoom = useCallback((nodes, screen) => {
    if (!screen) { return; }
    const suggestedZoom = suggestZoom(nodes, layoutSpace, screen);
    zoom.set(suggestedZoom);
  }, []);

  return {
    viewport,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    autoZoom,
  };
};

export default useViewport;
