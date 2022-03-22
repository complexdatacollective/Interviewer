import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { compose } from 'recompose';
import cx from 'classnames';
import { DragSource, DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';
import useAnimationSettings from '../hooks/useAnimationSettings';

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const variants = {
  show: {
    translateY: ['-50%', '0%'],
    opacity: [0, 1],
  },
  hidden: {
    translateY: 0,
    opacity: 0,
  },
};

const reducedMotionVariants = {
  show: { opacity: 1 },
  hidden: { opacity: 0 },
};

const getItemRenderer = (ItemComponent, DragComponent) => {
  const Component = DragSource(ItemComponent);

  return ({
    id,
    data,
    props,
    itemType,
    allowDragging,
  }) => {
    const { duration, easing } = useAnimationSettings();
    const reducedMotion = useReducedMotion();

    const cellVariants = reducedMotion
      ? reducedMotionVariants
      : variants;

    const preview = DragComponent
      ? <DragComponent {...data} />
      : null;

    return (
      <motion.div
        className="list__item"
        transition={{ duration: duration.standard, ease: easing }}
        variants={cellVariants}
        key={id}
      >
        <Component
          {...props}
          allowDrag={allowDragging}
          meta={() => ({ data, id, itemType })}
          preview={preview}
        />
      </motion.div>
    );
  };
};

/**
  * Renders an arbitrary list of items using itemComponent.
  *
  * Includes drag and drop functionality.
  *
  * @prop {Array} items Items in format [{ id, props: {}, data: {} }, ...]
  * @prop {React Component} emptyComponent React component to render when items is an empty array.
  * @prop {React Component} itemComponent React component, rendered with `{ props }` from item.
  * `{ data }`, `id`, and `itemType` is passed to the drag and drop state.
  * @prop {React node} placeholder React node. If provided will override rendering of
  * items/emptyComponent and will be rendered instead.
  * example usage: `<List placeholder={(<div>placeholder</div>)} />`
  * @prop {string} itemType itemType used by drag and drop functionality
  */
const List = ({
  className,
  items,
  itemComponent: ItemComponent,
  dragComponent: DragComponent,
  emptyComponent: EmptyComponent,
  placeholder,
  willAccept,
  isOver,
  itemType,
  allowDragging,
}) => {
  const { duration } = useAnimationSettings();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: duration.fast / 2,
      },
    },
  };

  const classNames = cx(
    'list',
    className,
    { 'list--drag': willAccept },
    { 'list--hover': willAccept && isOver },
  );

  const ItemRenderer = useMemo(
    () => getItemRenderer(ItemComponent, DragComponent),
    [ItemComponent, DragComponent],
  );

  const context = {};

  // const showOverlay = !!OverlayComponent;
  // If placeholder is provider it supercedes everything
  const showPlaceholder = !!placeholder;
  // If items is provided but is empty show the empty component
  const showEmpty = !placeholder && items && items.length === 0;
  // Otherwise show the results!
  const showResults = !placeholder && items && items.length > 0;

  return (
    <ListContext.Provider value={context}>
      <motion.div
        className={classNames}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        { showPlaceholder && placeholder }
        { showEmpty && <EmptyComponent />}

        { showResults && (
          items.map((item) => (
            <ItemRenderer
              key={item.id}
              itemType={itemType}
              allowDragging={allowDragging}
              {...item}
            />
          ))
        )}
      </motion.div>
    </ListContext.Provider>
  );
};

List.propTypes = {
  itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  emptyComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  placeholder: PropTypes.node,
  itemType: PropTypes.string,
  allowDragging: PropTypes.bool,
};

List.defaultProps = {
  itemComponent: NoopComponent,
  emptyComponent: NoopComponent,
  placeholder: null,
  itemType: 'LIST',
  allowDragging: true,
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(List);
