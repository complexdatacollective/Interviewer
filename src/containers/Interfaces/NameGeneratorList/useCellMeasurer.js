import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { debounce } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import uuid from 'uuid';

const useCellMeasurer = (ItemComponent, columns, items) => {
  const innerRef = useRef(null);
  const outerRef = useRef(null);
  const id = useMemo(() => uuid(), []);
  const hiddenSizingEl = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

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
    if (!outerRef.current) { return () => {}; }

    const handleResize = debounce(() => {
      const { width } = outerRef.current.getBoundingClientRect();

      if (hiddenSizingEl && width !== containerWidth) {
        hiddenSizingEl.current.style.width = `${width / columns}px`;
        setContainerWidth(width);
      }
    }, 500);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(outerRef.current);

    return () => resizeObserver.disconnect();
  }, [outerRef.current]);

  const rowHeight = useCallback(
    (rowIndex) => {
      if (!hiddenSizingEl.current) { return 0; }

      const start = rowIndex * columns;
      const end = start + columns;

      const height = items.slice(start, end)
        .reduce(
          (acc, item) => {
            hiddenSizingEl.current.innerHTML = renderToString(<ItemComponent {...item.props} />);
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

  const key = useMemo(() => uuid(), [containerWidth, rowHeight, hiddenSizingEl]);

  return {
    innerRef,
    outerRef,
    rowHeight,
    key,
  };
};

export default useCellMeasurer;
