import React, { useContext, useMemo } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { DragSource } from '../../../behaviours/DragAndDrop';
import useCellMeasurer from './useCellMeasurer';

const ListContext = React.createContext({ items: [], columns: 0 });

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
}) => {
  const CellRenderer = useMemo(
    () => getCellRenderer(DragSource(ItemComponent)),
    [ItemComponent, columns],
  );

  const context = useMemo(() => ({ items, columns }), [items, columns]);
  const measurer = useCellMeasurer(ItemComponent, columns, items);

  return (
    <div
      className="hyper-list"
      style={{ flex: 1, minHeight: '500' }}
    >
      <ListContext.Provider value={context}>
        <AutoSizer>
          {({ height, width }) => {
            const adjustedColumns = Math.ceil(columns); // should never be 0
            const columnWidth = () => width / adjustedColumns;
            const columnCount = (
              adjustedColumns > items.length ? items.length : adjustedColumns
            );
            const rowCount = Math.ceil(items.length || 0) / adjustedColumns;

            const gridOptions = {
              columnCount,
              rowCount,
              columnWidth,
            };

            return (
              <Grid
                {...gridOptions}
                {...measurer}
                height={height}
                width={width}
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
  itemComponent: () => null,
  columns: 2,
  rowHeight: 300,
};

export default HyperList;
