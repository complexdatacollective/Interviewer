import React from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import useCellMeasurer from './useCellMeasurer';

const AutosizableGrid = ({
  height,
  width,
  columns,
  items,
  itemComponent: ItemComponent,
  children,
}) => {
  const adjustedColumns = Math.ceil(columns); // should never be 0
  const rowCount = Math.ceil(items.length || 0) / adjustedColumns;
  const columnCount = (
    adjustedColumns > items.length ? items.length : adjustedColumns
  );
  const columnWidth = () => width / adjustedColumns;

  const { rowHeight, ready, key } = useCellMeasurer(ItemComponent, columns, columnWidth(), items);

  if (!ready) { return null; }

  return (
    <Grid
      height={height}
      width={width}
      columnCount={columnCount}
      rowCount={rowCount}
      columnWidth={columnWidth}
      rowHeight={rowHeight}
      itemComponent={ItemComponent}
      key={key}
    >
      {children}
    </Grid>
  );
};

export default AutosizableGrid;
