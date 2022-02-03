import React, {
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import { compose } from 'recompose';
import cx from 'classnames';
import { DragSource, DropTarget, MonitorDropTarget } from '../../behaviours/DragAndDrop';

const SCROLL_BORDER = 14; // ~1rem
const GUTTER_SIZE = 14;

const ListContext = React.createContext({ items: []});

const NoopComponent = () => null;

const getRowRenderer = (Component, DragComponent) => ({
  index,
  style,
}) => {
  const {
    items,
    itemType,
    dynamicProperties,
  } = useContext(ListContext);

  const item = items[index];

  if (!item) { return null; }

  const { id, data, props } = item;
  const { disabled } = dynamicProperties;

  const isDisabled = disabled && disabled.includes(id);

  const preview = DragComponent
    ? <DragComponent {...data} />
    : null;

  console.log(style, `calc(${style.width} - ${(GUTTER_SIZE * 2)}px)`);

  return (
    <div
      className="hyper-list__item"
      style={{
        ...style,
        left: style.left + GUTTER_SIZE,
        top: style.top + GUTTER_SIZE,
        width: `calc(${style.width} - ${(GUTTER_SIZE * 2)}px)`,
        height: style.height - GUTTER_SIZE,
      }}
      key={id}
    >
      <Component
        {...props}
        meta={() => ({ data, id, itemType })}
        disabled={isDisabled}
        allowDrag={!isDisabled}
        preview={preview}
      />
    </div>
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
  itemType,
  emptyComponent: EmptyComponent,
  placeholder,
  willAccept,
  isOver,
}) => {
  const RowRenderer = useMemo(
    () => getRowRenderer(DragSource(ItemComponent), DragComponent),
    [ItemComponent, DragComponent],
  );

  const context = useMemo(() => ({
    items,
    dynamicProperties,
    itemType,
  }), [items, dynamicProperties, itemType]);

  const classNames = cx(
    'hyper-list',
    className,
    { 'hyper-list--drag': willAccept },
    { 'hyper-list--hover': willAccept && isOver },
  );

  const SizeRenderer = useCallback((props) => (
    <div className="hyper-list__item"><ItemComponent {...props} /></div>
  ), [ItemComponent]);

  const getItemSize = (item, width) => {
    if (!width) { return 0; }

    const itemData = items[item];
    const { id, data, props } = itemData;
    console.log(itemData, width);
    const newHiddenSizingEl = document.createElement('div');

    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.width = `${width - GUTTER_SIZE}px`;
    newHiddenSizingEl.style.pointerEvents = 'none';

    newHiddenSizingEl.style.visibility = 'hidden';

    document.body.appendChild(newHiddenSizingEl);
    newHiddenSizingEl.innerHTML = renderToString(<SizeRenderer {...props} />);
    console.log(newHiddenSizingEl);
    const height = newHiddenSizingEl.clientHeight;
    console.log('item size:', height);
    document.body.removeChild(newHiddenSizingEl);

    return height + GUTTER_SIZE;
  };

  // const showOverlay = !!OverlayComponent;
  // If placeholder is provider it supercedes everything
  const showPlaceholder = !!placeholder;
  // If items is provided but is empty show the empty component
  const showEmpty = !placeholder && items && items.length === 0;
  // Otherwise show the results!
  const showResults = !placeholder && items && items.length > 0;

  return (
    <motion.div
      className={classNames}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ListContext.Provider value={context}>
        <div className="hyper-list__container">
          <div className="hyper-list__sizer">
            <AnimatePresence exitBeforeEnter>
              { showPlaceholder && placeholder }
              { showEmpty && <EmptyComponent />}
              <AutoSizer>
                {(containerSize) => {
                  if (!showResults) { return null; }
                  console.log('containersize', containerSize.width);
                  return (
                    <List
                      className="hyper-list__grid"
                      height={containerSize.height}
                      width={containerSize.width}
                      itemSize={(item) => getItemSize(item, containerSize.width)}
                      estimatedItemSize={getItemSize(0)}
                      itemCount={items.length}
                    >
                      {RowRenderer}
                    </List>
                  );
                }}
              </AutoSizer>
            </AnimatePresence>
          </div>
        </div>
      </ListContext.Provider>
    </motion.div>
  );
};

HyperList.propTypes = {
  itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  emptyComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  placeholder: PropTypes.node,
  itemType: PropTypes.string,
};

HyperList.defaultProps = {
  itemComponent: NoopComponent,
  emptyComponent: NoopComponent,
  placeholder: null,
  itemType: 'HYPER_LIST',
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(HyperList);
