import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { compose, defaultProps } from 'recompose';
import cx from 'classnames';
import { DragSource, DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';
import useAnimationSettings from '../hooks/useAnimationSettings';

const ListContext = React.createContext({ items: [], columns: 0 });

const NoopComponent = () => null;

const variants = {
  show: {
    scale: 1,
    opacity: 1,
  },
  hidden: {
    scale: 0,
    opacity: 0.5,
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
  }) => {
    const { duration } = useAnimationSettings();
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
        transition={{ duration: duration.standard }}
        variants={cellVariants}
        key={id}
      >
        <Component
          {...props}
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
}) => {
  const { duration } = useAnimationSettings();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
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
          items.map((item) => (<ItemRenderer key={item.id} itemType={itemType} {...item} />))
        )}
      </motion.div>
    </ListContext.Provider>
  );
};

List.propTypes = {
  itemComponent: PropTypes.func,
  emptyComponent: PropTypes.func,
  placeholder: PropTypes.node,
  itemType: PropTypes.string,
};

List.defaultProps = {
  itemComponent: NoopComponent,
  emptyComponent: NoopComponent,
  placeholder: null,
  itemType: 'LIST',
};

export default compose(
  defaultProps(() => ({
    id: 'list',
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(List);