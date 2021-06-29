import React, {
  useContext,
  useMemo,
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import { motion, useReducedMotion } from 'framer-motion';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose } from 'recompose';
import uuid from 'uuid';
import cx from 'classnames';
import useGridSizer from './useGridSizer';
import { DragSource, DropTarget, MonitorDropTarget } from '../../behaviours/DragAndDrop';
import useAnimationSettings from '../../hooks/useAnimationSettings';
import useDebounce from '../../hooks/useDebounce';

const SCROLL_BORDER = 14; // ~1rem

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const getDataIndex = (columns, { rowIndex, columnIndex }) => (
  (rowIndex * columns) + columnIndex
);

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

const getCellRenderer = (Component, DragComponent) => ({
  columnIndex,
  rowIndex,
  style,
}) => {
  const { duration, easing } = useAnimationSettings();

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

  const { id, data, props } = item;
  const { disabled } = dynamicProperties;

  const isDisabled = disabled && disabled.includes(id);

  const cellVariants = reducedMotion
    ? reducedMotionVariants
    : variants;

  const preview = DragComponent
    ? <DragComponent {...data} />
    : null;

  return (
    <motion.div
      className="hyper-list__item"
      style={style}
      initial="hidden"
      animate="visible"
      transition={{ duration: duration.standard, easing }}
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
  const [width, setWidth] = useState(0);
  const debouncedWidth = useDebounce(width, 1000);
  const columnCount = useMemo(() => {
    if (!debouncedWidth) { return 1; }
    return typeof columns === 'number'
      ? columns
      : columns(debouncedWidth);
  }, [columns, debouncedWidth]);

  const SizeRenderer = useCallback((props) => (
    <div className="hyper-list__item"><ItemComponent {...props} /></div>
  ), [ItemComponent]);

  const [gridProps, ready] = useGridSizer(SizeRenderer, items, columnCount, debouncedWidth);

  const handleResize = useCallback(
    ({ width: newWidth }) => setWidth(newWidth - SCROLL_BORDER),
    [setWidth],
  );

  const itemKey = useCallback((index) => {
    const dataIndex = getDataIndex(columnCount, index);

    // If last row is shorter than number of columns
    if (dataIndex >= items.length) { return null; }

    const key = items[dataIndex] && items[dataIndex].id;

    if (!key) {
      // Something went wrong, this is a failsafe but will force a rerender every time
      console.debug('`itemKey()` returned undefined in `<HyperList />`'); // eslint-disable-line no-console
      return uuid();
    }

    return key;
  }, [columnCount, items]);

  const CellRenderer = useMemo(
    () => getCellRenderer(DragSource(ItemComponent), DragComponent),
    [ItemComponent, DragComponent, columnCount],
  );

  const context = useMemo(() => ({
    items,
    columns: columnCount,
    dynamicProperties,
    itemType,
  }), [items, columnCount, dynamicProperties, itemType]);

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
          <div className="hyper-list__sizer">
            { showPlaceholder && placeholder }
            { showEmpty && <EmptyComponent />}
            <AutoSizer onResize={handleResize}>
              {(containerSize) => {
                // If auto sizer is not ready, items would be sized incorrectly
                if (!ready) { return null; }

                if (!showResults) { return null; }

                return (
                  <Grid
                    className="hyper-list__grid"
                    height={containerSize.height}
                    width={containerSize.width}
                    itemKey={itemKey}
                    {...gridProps}
                  >
                    {CellRenderer}
                  </Grid>
                );
              }}
            </AutoSizer>
          </div>
        </div>
      </ListContext.Provider>
    </div>
  );
};

HyperList.propTypes = {
  itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  emptyComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  placeholder: PropTypes.node,
  columns: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.func,
  ]),
  rowHeight: PropTypes.number,
  itemType: PropTypes.string,
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
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(HyperList);
