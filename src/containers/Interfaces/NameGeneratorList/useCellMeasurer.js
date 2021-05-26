import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import uuid from 'uuid';
import useDebounce from './useDebounce';

const useCellMeasurer = (ItemComponent, columns, columnWidth, items, defaultHeight = 150) => {
  const id = useMemo(() => uuid(), []);
  const hiddenSizingEl = useRef(null);
  const width = useDebounce(columnWidth, 300);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hiddenSizingEl.current) { return () => {}; }

    const newHiddenSizingEl = document.createElement('div');

    newHiddenSizingEl.classList.add(`hidden-sizing-element-${id}`);
    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.pointerEvents = 'none';

    // newHiddenSizingEl.style.zIndex = '1000000';
    newHiddenSizingEl.style.visibility = 'hidden';

    hiddenSizingEl.current = newHiddenSizingEl;

    document.body.appendChild(newHiddenSizingEl);

    setReady(true);

    return () => document.body.removeChild(newHiddenSizingEl);
  }, []);

  const rowHeight = useCallback(
    (rowIndex) => {
      // console.log('get row height');
      if (!hiddenSizingEl.current) { return defaultHeight; }

      if (width.current !== columnWidth) {
        hiddenSizingEl.current.style.width = `${columnWidth}px`;
      }

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
          defaultHeight,
        );
      // console.log('height', height);
      return height;
    },
    [hiddenSizingEl.current, items, columnWidth],
  );

  return { rowHeight, key: width, ready };
};

export default useCellMeasurer;
