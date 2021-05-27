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

const useGridSizer = (ItemComponent, items, columns, defaultHeight = 150) => {
  const id = useMemo(() => uuid(), []);
  const hiddenSizingEl = useRef(null);
  const [width, setWidth] = useState(0);
  // const debouncedWidth = useDebounce(width, 1000);
  const debouncedWidth = width;
  const [ready, setReady] = useState(false);
  const reallyReady = useMemo(() => ready && debouncedWidth > 0, [ready, debouncedWidth]);

  console.log('debouncwidth', debouncedWidth);

  const adjustedColumns = useMemo(() => Math.ceil(columns), [columns]); // should never be 0
  const rowCount = useMemo(() => (
    Math.ceil(items.length || 0) / adjustedColumns
  ), [items.length, adjustedColumns]);
  const columnCount = useMemo(() => (
    adjustedColumns > items.length ? items.length : adjustedColumns
  ), [items.length, adjustedColumns]);

  // console.log('columecount', columnCount);

  const columnWidth = useCallback(() => {
    const colWidth = debouncedWidth / adjustedColumns;
    // console.log({ colWidth });
    return colWidth;
  }, [debouncedWidth, adjustedColumns]);

  useEffect(() => {
    if (hiddenSizingEl.current) { return () => {}; }

    const newHiddenSizingEl = document.createElement('div');

    newHiddenSizingEl.classList.add(`hidden-sizing-element-${id}`);
    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.pointerEvents = 'none';

    newHiddenSizingEl.style.zIndex = '1000000';
    // newHiddenSizingEl.style.visibility = 'hidden';

    hiddenSizingEl.current = newHiddenSizingEl;

    document.body.appendChild(newHiddenSizingEl);

    setReady(true);

    return () => document.body.removeChild(newHiddenSizingEl);
  }, []);

  const rowHeight = useCallback(
    (rowIndex) => {
      // console.log('get row height');
      if (!hiddenSizingEl.current) { return defaultHeight; }

      if (width.current !== debouncedWidth) {
        hiddenSizingEl.current.style.width = `${debouncedWidth}px`;
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
    [hiddenSizingEl.current, items, columnWidth()],
  );

  return [
    {
      key: id, //debouncedWidth,
      columnCount,
      rowCount,
      columnWidth,
      rowHeight,
    },
    reallyReady,
    setWidth,
  ];
};

export default useGridSizer;
