import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { debounce } from 'lodash';
import uuid from 'uuid';

const useCellMeasurer = (ItemComponent, columns, items) => {
  const id = useMemo(() => uuid(), []);
  const hiddenSizingEl = useRef(null);
  const width = useRef(0);
  const [key, setKey] = useState(uuid());

  const setWidth = useCallback(debounce((newWidth) => {
    width.current = newWidth;
  }, 500));

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

    return () => document.body.removeChild(newHiddenSizingEl);
  }, []);

  const rowHeight = useCallback(
    (columnWidth) => (rowIndex) => {
      if (!hiddenSizingEl.current) { return 0; }

      if (width.current !== columnWidth) {
        hiddenSizingEl.current.style.width = `${columnWidth}px`;
        setWidth(columnWidth);
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
          0,
        );

      return height;
    },
    [hiddenSizingEl, items, columns, setWidth],
  );

  useEffect(() => {
    setKey(uuid());
  }, [width]);

  return { rowHeight, key };
};

export default useCellMeasurer;
