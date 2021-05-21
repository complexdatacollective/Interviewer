import React, { useContext, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { DragSource } from '../../../behaviours/DragAndDrop';

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
  const data = items[dataIndex];

  const uid = (data && data._uid);

  return (
    <motion.div
      className="hyper-list__card"
      style={style}
      initial="hidden"
      animate="visible"
      variants={variants}
      key={uid}
    >
      <Component {...data} />
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
  rowHeight,
}) => {
  const CellRenderer = useMemo(
    () => getCellRenderer(DragSource(ItemComponent)),
    [ItemComponent, columns],
  );

  const context = useMemo(() => ({ items, columns }), [items, columns]);

  return (
    <div
      className="hyper-list"
      style={{ flex: 1, minHeight: '500' }}
    >
      <ListContext.Provider value={context}>
        <AutoSizer>
          {({ height, width }) => {
            const adjustedColumns = Math.ceil(columns); // should never be 0
            const columnWidth = width / adjustedColumns;
            const columnCount = (
              adjustedColumns > items.length ? items.length : adjustedColumns
            );
            const rowCount = Math.ceil(items.length || 0) / adjustedColumns;

            const gridOptions = {
              columnCount,
              rowCount,
              rowHeight,
              columnWidth,
            };

            return (
              <Grid
                {...gridOptions}
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
