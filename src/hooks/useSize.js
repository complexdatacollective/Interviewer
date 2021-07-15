/* eslint-disable react/no-find-dom-node */

import { useRef, useEffect } from 'react';
import { isEqual } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';

const initialState = {
  width: 0,
  height: 0,
  y: 0,
  x: 0,
};

const useSize = (ref) => {
  const state = useRef(initialState);
  const raf = useRef();

  const trackSize = () => {
    const boundingClientRect = getAbsoluteBoundingRect(ref.current);

    const nextState = {
      width: boundingClientRect.width,
      height: boundingClientRect.height,
      y: boundingClientRect.top,
      x: boundingClientRect.left,
    };

    if (!isEqual(state.current, nextState)) {
      state.current = nextState;
    }

    raf.current = requestAnimationFrame(trackSize);
  };

  useEffect(() => {
    if (ref.current) {
      trackSize();
    }

    return () => cancelAnimationFrame(raf.current);
  }, [ref.current]);

  return state;
};

export default useSize;
