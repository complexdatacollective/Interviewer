import React, {
  useContext,
  useMemo,
  useCallback,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion, useReducedMotion } from 'framer-motion';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps } from 'recompose';
import cx from 'classnames';
import useGridSizer from './useGridSizer';
import { DragSource, DropTarget, MonitorDropTarget } from '../../behaviours/DragAndDrop';
import useAnimationSettings from '../../hooks/useAnimationSettings';

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const getDataIndex = (columns, { rowIndex, columnIndex }) => (
  (rowIndex * columns) + columnIndex
);

const getCellRenderer = (Component, DragComponent) => ({
  columnIndex,
  rowIndex,
  style,
}) => {
  const { duration } = useAnimationSettings();

  const variants = {
    visible: {
      scale: 1,
      opacity: 1,
    },
    hidden: {
      scale: 0,
      opacity: 0.5,
    },
  };

  const reducedMotionVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const {
    items,
    columns,
    itemType,
    dynamicProperties,
  } = useContext(ListContext);
  const dataIndex = getDataIndex(columns, { rowIndex, columnIndex });
  const item = items[dataIndex];
  const reducedMotion = useReducedMotion();

  if (!item) { return null; }

  const { props, id, data } = item;
  const { disabled } = dynamicProperties;

  const isDisabled = disabled && disabled.includes(id);

  const cellVariants = reducedMotion
    ? reducedMotionVariants
    : variants;

  const preview = DragComponent
    ? <DragComponent {...props} meta={{ data, id }} />
    : null;

  return (
    <motion.div
      className="hyper-list__item"
      style={style}
      initial="hidden"
      animate="visible"
      transition={{ duration: duration.slow }}
      variants={cellVariants}
      key={id}
    >
      <Component
        {...props}
        meta={() => ({ data, id, itemType })}
        disabled={isDisabled}
        allowDrag={!isDisabled}
        preview={preview}
      />
    </motion.div>
  );
};

/**
  * Renders an arbitrary list of items using itemComponent.
  *
  * Includes drag and drop functionality.
  *
  * @prop {Array} items Items in format [{ id, props: {}, data: {} }, ...]
  * @prop {Object} dynamicProperties Can be used for mutating properties,
  * that aren't necessarily part of item data. This is because items may
  * go through several filters before reaching HyperList, and these dynamic
  * properties may not be relevant (e.g. recomputing search results when
  * item values haven't changed). Currently only used to get the list of
  * disabled items.
  * @prop {React Component} emptyComponent React component to render when items is an empty array.
  * @prop {React Component} itemComponent React component, rendered with `{ props }` from item.
  * `{ data }`, `id`, and `itemType` is passed to the drag and drop state.
  * @prop {React node} placeholder React node. If provided will override rendering of
  * items/emptyComponent and will be rendered instead.
  * example usage: `<HyperList placeholder={(<div>placeholder</div>)} />`
  * @prop {number} columns Number of columns
  * @prop {string} itemType itemType used by drag and drop functionality
  */
const HyperList = ({
  className,
  items,
  dynamicProperties,
  itemComponent: ItemComponent,
  dragComponent: DragComponent,
  columns,
  itemType,
  emptyComponent: EmptyComponent,
  placeholder,
  willAccept,
  isOver,
}) => {
  const itemKey = useCallback((index) => {
    const dataIndex = getDataIndex(columns, index);
    return (items[dataIndex] && items[dataIndex].id) || dataIndex;
  }, [columns]);

  const CellRenderer = useMemo(
    () => getCellRenderer(DragSource(ItemComponent), DragComponent),
    [ItemComponent, DragComponent, columns],
  );

  const SizeRenderer = useCallback((props) => (
    <div className="hyper-list__item"><ItemComponent {...props} /></div>
  ), [ItemComponent]);

  const context = useMemo(() => ({
    items,
    columns,
    dynamicProperties,
    itemType,
  }), [items, columns, dynamicProperties, itemType]);

  const [gridProps, ready, setWidth] = useGridSizer(SizeRenderer, items, columns);

  const handleResize = useCallback(({ width }) => setWidth(width), [setWidth]);

  const classNames = cx(
    'hyper-list',
    className,
    { 'hyper-list--drag': willAccept },
    { 'hyper-list--hover': willAccept && isOver },
  );

  // const showOverlay = !!OverlayComponent;
  // If placeholder is provider it supercedes everything
  const showPlaceholder = !!placeholder;
  // If items is provided but is empty show the empty component
  const showEmpty = !placeholder && items && items.length === 0;
  // Otherwise show the results!
  const showResults = !placeholder && items && items.length > 0;

  return (
    <div className={classNames}>
      <ListContext.Provider value={context}>
        <div className="hyper-list__container">
          { showPlaceholder && placeholder }
          { showEmpty && <EmptyComponent />}
          <AutoSizer onResize={handleResize}>
            {({ width, height }) => {
              // If auto sizer is not ready, items would be sized incorrectly
              if (!ready) { return null; }

              if (!showResults) { return null; }

              return (
                <Grid
                  className="hyper-list__grid"
                  height={height}
                  width={width}
                  itemKey={itemKey}
                  {...gridProps}
                >
                  {CellRenderer}
                </Grid>
              );
            }}
          </AutoSizer>
        </div>
      </ListContext.Provider>
    </div>
  );
};

HyperList.propTypes = {
};

HyperList.defaultProps = {
  itemComponent: NoopComponent,
  emptyComponent: NoopComponent,
  placeholder: null,
  columns: 2,
  rowHeight: 300,
  itemType: 'HYPER_LIST',
};

export default compose(
  defaultProps(() => ({
    id: 'hyper-list',
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(HyperList);
