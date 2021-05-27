import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useEffect,
  useCallback,
  useState,
} from 'react';
import uuid from 'uuid';
import useDebounce from './useDebounce';

const useGridSizer = (ItemComponent, items, columns, defaultHeight = 150) => {
  const id = useMemo(() => uuid(), []);
  const [hiddenSizingEl, setHiddenSizingElement] = useState(null);
  const [width, setWidth] = useState(0);
  const debouncedWidth = useDebounce(width, 1000);
  const ready = useMemo(() => (
    hiddenSizingEl && debouncedWidth > 0
  ), [hiddenSizingEl, debouncedWidth]);

  const adjustedColumns = useMemo(() => Math.ceil(columns), [columns]); // should never be 0
  const rowCount = useMemo(() => (
    Math.ceil(items.length || 0) / adjustedColumns
  ), [items.length, adjustedColumns]);
  const columnCount = useMemo(() => (
    adjustedColumns > items.length ? items.length : adjustedColumns
  ), [items.length, adjustedColumns]);

  const columnWidth = useCallback(() => (
    debouncedWidth / adjustedColumns
  ), [debouncedWidth, adjustedColumns]);

  useEffect(() => {
    if (hiddenSizingEl) { return () => {}; }

    const newHiddenSizingEl = document.createElement('div');

    newHiddenSizingEl.classList.add(`hidden-sizing-element-${id}`);
    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.pointerEvents = 'none';

    // newHiddenSizingEl.style.zIndex = '1000000';
    newHiddenSizingEl.style.visibility = 'hidden';

    // hiddenSizingEl.current = newHiddenSizingEl;

    document.body.appendChild(newHiddenSizingEl);

    setHiddenSizingElement(newHiddenSizingEl);

    return () => document.body.removeChild(newHiddenSizingEl);
  }, []);

  const rowHeight = useCallback(
    (rowIndex) => {
      if (!hiddenSizingEl) { return defaultHeight; }

      hiddenSizingEl.style.width = `${columnWidth()}px`;

      const start = rowIndex * columns;
      const end = start + columns;

      const height = items.slice(start, end)
        .reduce(
          (acc, item) => {
            hiddenSizingEl.innerHTML = renderToString(<ItemComponent {...item.props} />);
            return (
              hiddenSizingEl.clientHeight > acc
                ? hiddenSizingEl.clientHeight
                : acc
            );
          },
          0,
        );

      return height > 0 ? height : defaultHeight;
    },
    [hiddenSizingEl, items, columnWidth()],
  );

  return [
    {
      key: debouncedWidth,
      columnCount,
      rowCount,
      columnWidth,
      rowHeight,
    },
    ready,
    setWidth,
  ];
};

export default useGridSizer;
