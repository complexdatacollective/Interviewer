import React, {
  useContext,
  useMemo,
  useCallback,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion } from 'framer-motion';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, withProps } from 'recompose';
import useGridSizer from './useGridSizer';
import { DragSource, DropTarget, MonitorDropTarget } from '../../../behaviours/DragAndDrop';

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const variants = {
  visible: { scale: 1, transition: { delay: 0.15 } },
  hidden: { scale: 0, transition: { delay: 0.15 } },
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

  const [gridProps, ready, setWidth] = useGridSizer(ItemComponent, items, columns);

  const handleResize = useCallback(({ width }) => setWidth(width), [setWidth]);

  return (
    <div
      className="hyper-list"
      style={{ flex: 1, minHeight: '500' }}
    >
      <ListContext.Provider value={context}>
        <AutoSizer onResize={handleResize}>
          {({ width, height }) => {
            if (items.length === 0 || !ready) {
              return <EmptyComponent />;
            }

            return (
              <Grid
                height={height}
                width={width}
                {...gridProps}
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

export default compose(
  withProps(() => ({
    id: 'hyper-list',
    accepts: () => true,
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(HyperList);
