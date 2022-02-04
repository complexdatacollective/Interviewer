import { renderToString } from 'react-dom/server';
import React, {
  useMemo,
  useEffect,
  useCallback,
  useState,
} from 'react';
import uuid from 'uuid';

/**
 * This is an enhancement for react-window, which allows items in a grid
 * to have dynamic heights.
 *
 * Because items may flow, this actually renders the item in a hidden div
 * taking into account the column width.
 *
 * Each row will be sized according to the largest item on that row.
 *
 * Usage:
 *
 * const [
 *   gridProps,
 *   ready, // has hidden div been rendered, ready to measure items
 *   setWidth, // how wide is the total container width (all columns)
 * ] = useGridSizer(ItemComponent, [{}, ...], 2);
 *
 * return (
 *   <Grid {...gridProps} />
 * );
 */
const useGridSizer = (ItemComponent, items, columns, width, defaultHeight = 150) => {
  const id = useMemo(() => uuid(), []);
  const [hiddenSizingEl, setHiddenSizingElement] = useState(null);
  const ready = useMemo(() => (
    hiddenSizingEl && width > 0
  ), [hiddenSizingEl, width]);

  const itemCount = (items && items.length) || 0;

  const adjustedColumns = useMemo(() => Math.ceil(columns), [columns]); // should never be 0
  const rowCount = useMemo(() => (
    Math.ceil(Math.ceil(itemCount || 0) / adjustedColumns)
  ), [itemCount, adjustedColumns]);

  const columnCount = useMemo(() => (
    adjustedColumns > itemCount ? itemCount : adjustedColumns
  ), [itemCount, adjustedColumns]);

  const columnWidth = useCallback(() => (
    width / adjustedColumns
  ), [width, adjustedColumns]);

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

      hiddenSizingEl.style.width = `${columnWidth()}px` - 14; // 14 is gutter

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

      return height > 0 ? height + 14 : defaultHeight;
    },
    [hiddenSizingEl, items, columnWidth()],
  );

  return [
    {
      key: width,
      columnCount,
      rowCount,
      columnWidth,
      rowHeight,
    },
    ready,
  ];
};

export default useGridSizer;
