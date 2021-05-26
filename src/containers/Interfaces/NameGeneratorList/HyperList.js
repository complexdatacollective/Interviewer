import React, { useContext, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { compose, withProps } from 'recompose';
import AutosizableGrid from './AutosizableGrid';
import { DragSource, DropTarget, MonitorDropTarget } from '../../../behaviours/DragAndDrop';

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
  const { props, id, data } = items[dataIndex];

  return (
    <motion.div
      className="hyper-list__item"
      style={style}
      initial="hidden"
      animate="visible"
      variants={variants}
      key={id}
    >
      <Component {...props} meta={() => ({ data, id })} />
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

  return (
    <div
      className="hyper-list"
      style={{ flex: 1, minHeight: '500' }}
    >
      <ListContext.Provider value={context}>
        <AutoSizer>
          {({ height, width }) => {
            if (items.length === 0) {
              return <EmptyComponent />;
            }

            return (
              <AutosizableGrid
                height={height}
                width={width}
                columns={columns}
                items={items}
                itemComponent={ItemComponent}
              >
                {CellRenderer}
              </AutosizableGrid>
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

export default compose(
  withProps(() => ({
    id: 'hyper-list',
    accepts: () => true,
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(HyperList);
