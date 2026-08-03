/**
 * Shim for react-resize-aware that provides the jsx function
 * which is missing from the package's dist build.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { jsx } from 'react/jsx-runtime';

// Styles for the resize listener iframe
const listenerStyle = {
  display: 'block',
  opacity: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: -1,
  maxHeight: 'inherit',
  maxWidth: 'inherit',
};

// ResizeListener component
const ResizeListener = ({ onResize }) => {
  const ref = useRef();

  // `onResize` (and thus the handlers below) is recreated each render; the effect
  // must mount once and the listener it adds must keep the same identity for the
  // add/remove pair to match. Keep the latest `onResize` in a ref and use stable
  // handlers, so the effect can run with empty deps (mount/unmount only).
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const getWindow = useCallback(() => {
    return ref.current?.contentDocument?.defaultView;
  }, []);

  const handleResize = useCallback(() => {
    onResizeRef.current(ref);
  }, []);

  const handleLoad = useCallback(() => {
    handleResize();
    const win = getWindow();
    if (win) {
      win.addEventListener('resize', handleResize);
    }
  }, [getWindow, handleResize]);

  useEffect(() => {
    if (getWindow()) {
      handleLoad();
    } else if (ref.current?.addEventListener) {
      ref.current.addEventListener('load', handleLoad);
    }

    return () => {
      const win = getWindow();
      if (win && typeof win.removeEventListener === 'function') {
        win.removeEventListener('resize', handleResize);
      }
    };
  }, [getWindow, handleLoad, handleResize]);

  return jsx('iframe', {
    'style': listenerStyle,
    'src': 'about:blank',
    'ref': ref,
    'aria-hidden': true,
    'tabIndex': -1,
    'frameBorder': 0,
  });
};

// Default size reporter
const defaultReporter = (el) => ({
  width: el != null ? el.offsetWidth : null,
  height: el != null ? el.offsetHeight : null,
});

// Main hook
const useResizeAware = (reporter = defaultReporter) => {
  const [sizes, setSizes] = useState(reporter(null));

  const onResize = useCallback(
    (ref) => {
      setSizes(reporter(ref.current));
    },
    [reporter],
  );

  const resizeListener = useMemo(
    () => jsx(ResizeListener, { onResize }),
    [onResize],
  );

  return [resizeListener, sizes];
};

export default useResizeAware;
