import React, { useContext, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';

const ListContext = React.createContext([]);

const variants = {
  visible: { scale: 1 },
  hidden: { scale: 0 },
};

const getCellRenderer = (Component, columns) => ({
  columnIndex,
  rowIndex,
  style,
}) => {
  const items = useContext(ListContext);
  const dataIndex = (columnIndex * columns) + rowIndex;
  const data = items[dataIndex];

  return (
    <motion.div
      className="hyper-list__card"
      style={style}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <Component {...data} />
    </motion.div>
  );
};

/**
  * HyperCardList
  */
const HyperCardList = ({
  items,
  itemRenderer: ItemRenderer,
  columns,
  rowHeight,
}) => {
  const CellRenderer = useMemo(
    () => getCellRenderer(ItemRenderer, columns),
    [ItemRenderer],
  );

  return (
    <div
      className="hyper-list"
      style={{ flex: 1 }}
    >
      <ListContext.Provider value={items}>
        <AutoSizer>
          {({ height, width }) => {
            const gridOptions = {
              columnCount: columns,
              rowCount: items.length / columns,
              rowHeight,
              columnWidth: width / columns,
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

HyperCardList.propTypes = {
};

HyperCardList.defaultProps = {
  itemRenderer: () => null,
  columns: 2,
  rowHeight: 300,
};

export default HyperCardList;
