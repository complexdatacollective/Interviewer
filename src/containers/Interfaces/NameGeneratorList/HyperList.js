import React, { useContext, useMemo } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { DragSource } from '../../../behaviours/DragAndDrop';
import useCellMeasurer from './useCellMeasurer';

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const variants = {
  visible: { scale: 1 },
  hidden: { scale: 0 },
};

const getCellRenderer = (Component) => ({
  columnIndex,
  rowIndex,
  style,
}) => {
  const { items, columns } = useContext(ListContext);
  const dataIndex = (rowIndex * columns) + columnIndex;
  const { props, id } = items[dataIndex];

  return (
    <motion.div
      className="hyper-list__item"
      style={style}
      initial="hidden"
      animate="visible"
      variants={variants}
      key={id}
    >
      <Component {...props} />
    </motion.div>
  );
};

/**
  * HyperList
  */
const HyperList = ({
  items,
  itemComponent: ItemComponent,
  columns,
  emptyComponent: EmptyComponent,
}) => {
  const CellRenderer = useMemo(
    () => getCellRenderer(DragSource(ItemComponent)),
    [ItemComponent, columns],
  );

  const context = useMemo(() => ({ items, columns }), [items, columns]);
  const { rowHeight, key } = useCellMeasurer(ItemComponent, columns, items);

  const adjustedColumns = Math.ceil(columns); // should never be 0
  const rowCount = Math.ceil(items.length || 0) / adjustedColumns;
  const columnCount = (
    adjustedColumns > items.length ? items.length : adjustedColumns
  );

  return (
    <div
      className="hyper-list"
      style={{ flex: 1, minHeight: '500' }}
    >
      <ListContext.Provider value={context}>
        <AutoSizer>
          {({ height, width }) => {
            const columnWidth = () => width / adjustedColumns;

            if (items.length === 0) {
              return <EmptyComponent />;
            }

            return (
              <Grid
                height={height}
                width={width}
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={columnWidth}
                rowHeight={rowHeight(columnWidth())}
                key={key}
              >
                {CellRenderer}
              </Grid>
            );
          }}
        </AutoSizer>
      </ListContext.Provider>
    </div>
  );
};

HyperList.propTypes = {
};

HyperList.defaultProps = {
  itemComponent: NoopComponent,
  emptyComponent: NoopComponent,
  columns: 2,
  rowHeight: 300,
};

export default HyperList;
