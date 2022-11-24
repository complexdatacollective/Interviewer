/* eslint-disable no-nested-ternary */
import React, {
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { compose } from 'recompose';
import { AnimatePresence, motion } from 'framer-motion';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import cx from 'classnames';
import { DragSource, DropTarget, MonitorDropTarget } from '../../behaviours/DragAndDrop';

const LargeRosterNotice = () => (
  <div
    className="large-roster-notice__wrapper"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <motion.div
      className="large-roster-notice"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Too many items to display.</h2>
      <p>Use the search feature to see results here.</p>
    </motion.div>
  </div>
);

const GUTTER_SIZE = 14;

const ListContext = React.createContext({ items: [] });

const NoopComponent = () => null;

const getRowRenderer = (Component, DragComponent, allowDragging) => ({
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
        allowDrag={allowDragging && !isDisabled}
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
  emptyComponent: EmptyComponent,
  placeholder,
  itemType,
  showTooMany,
  allowDragging,
}) => {
  const RowRenderer = useMemo(
    () => getRowRenderer(DragSource(ItemComponent), DragComponent, allowDragging),
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
  );

  const SizeRenderer = useCallback((props) => (
    <div className="hyper-list__item"><ItemComponent {...props} /></div>
  ), [ItemComponent]);

  const getItemSize = (item, listWidth) => {
    if (!listWidth) { return 0; }

    const itemData = items[item];
    const { props } = itemData;
    const newHiddenSizingEl = document.createElement('div');

    newHiddenSizingEl.style.position = 'absolute';
    newHiddenSizingEl.style.top = '0';
    newHiddenSizingEl.style.width = `${listWidth - (GUTTER_SIZE * 2) - 14}px`; // Additional 14 for scrollbar
    newHiddenSizingEl.style.pointerEvents = 'none';

    newHiddenSizingEl.style.visibility = 'hidden';

    document.body.appendChild(newHiddenSizingEl);
    newHiddenSizingEl.innerHTML = renderToString(<SizeRenderer {...props} />);
    const height = newHiddenSizingEl.clientHeight;
    document.body.removeChild(newHiddenSizingEl);

    return height + GUTTER_SIZE;
  };

  // If placeholder is provider it supersedes everything
  const showPlaceholder = !!placeholder;
  // If items is provided but is empty show the empty component
  const showEmpty = !placeholder && items && items.length === 0;
  // Otherwise show the results!
  const showResults = !placeholder && items && items.length > 0;

  return (
    <>
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
                { showPlaceholder ? placeholder : (
                  showEmpty ? <EmptyComponent /> : (
                    <AutoSizer>
                      {(containerSize) => {
                        if (!showResults) { return null; }
                        return (
                          <List
                            key={containerSize.width}
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
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </ListContext.Provider>
      </motion.div>
      <AnimatePresence>
        { showTooMany && (
          <LargeRosterNotice />
        )}
      </AnimatePresence>
    </>
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
