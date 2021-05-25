import React from 'react';
import { compose, withProps } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DropTarget, MonitorDropTarget } from '../../../behaviours/DragAndDrop';

/**
  * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
  */
const NodeDropArea = ({
  className,
  willAccept,
  isOver,
}) => {
  const classNames = cx(
    className,
    'node-drop-area',
    { 'node-drop-area--active': willAccept },
    { 'node-drop-area--hover': willAccept && isOver },
  );

  return <div className={classNames} />;
};

NodeDropArea.propTypes = {
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
};

NodeDropArea.defaultProps = {
  isOver: false,
  willAccept: false,
};

export default compose(
  withProps(({ onDrop }) => ({
    id: 'node-drop-area',
    accepts: () => true,
    onDrop: ({ meta }) => onDrop && onDrop(meta),
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(NodeDropArea);
