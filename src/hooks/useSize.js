import { useState, useLayoutEffect } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

// Intended as a replacement for ScreenManager, but I couldn't get it working
// It seems the issue is that ResizeObserver doesn't calculate top/left the
// same way as getBoundingClientRect.
const useSize = (target) => {
  const [size, setSize] = useState();

  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => {
    const bb = entry.target.getBoundingClientRect();
    setSize(bb);
  });

  return size;
};

export default useSize;
