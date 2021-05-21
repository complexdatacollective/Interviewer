import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import uuid from 'uuid';

const useCellMeasurer2 = (ItemComponent, columns, items) => {
  const innerRef = useRef(null);
  const id = useMemo(() => uuid(), []);
  const hiddenSizingEl = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!innerRef.current) { return; }
    if (hiddenSizingEl.current) { return; }

    const newHiddenSizingEl = document.createElement('div');

    const width = innerRef.current.clientWidth / columns;

    newHiddenSizingEl.classList.add(`hidden-sizing-element-${id}`);
    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.width = `${width}px`;
    newHiddenSizingEl.style.pointerEvents = 'none';
    // newHiddenSizingEl.style.zIndex = '1000000';
    newHiddenSizingEl.style.visibility = 'hidden';

    hiddenSizingEl.current = newHiddenSizingEl;

    document.body.appendChild(newHiddenSizingEl);
  }, [innerRef.current, id]);

  useEffect(() => {
    if (!innerRef.current) { return () => {}; }

    const handleResize = () => {
      // if (!innerRef.current) { return; }

      const { width } = innerRef.current.getBoundingClientRect();

      if (hiddenSizingEl) {
        hiddenSizingEl.current.style.width = `${width / columns}px`;
      }

      setWidth(width);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(innerRef.current);

    return () => resizeObserver.disconnect();
  }, [innerRef.current]);

  const rowHeight = useCallback(
    (rowIndex) => {
      if (!hiddenSizingEl.current) { return 0; }

      const start = rowIndex * columns;
      const end = start + columns;

      const height = items.slice(start, end)
        .reduce(
          (acc, item) => {
            hiddenSizingEl.current.innerHTML = renderToString(<ItemComponent {...item} />);
            return (
              hiddenSizingEl.current.clientHeight > acc
                ? hiddenSizingEl.current.clientHeight
                : acc
            );
          },
          0,
        );

      return height;
    },
    [hiddenSizingEl, items, columns],
  );

  const key = useMemo(() => uuid(), [width, rowHeight, hiddenSizingEl]);

  return {
    innerRef,
    rowHeight,
    key,
  };
};

export default useCellMeasurer2;
