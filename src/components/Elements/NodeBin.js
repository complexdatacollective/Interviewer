import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DropTarget } from '../../behaviours/DragAndDrop';

/**
  * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
  */
const NodeBin = ({ isDraggableDeleteable, hover }) => {
  const classNames = cx(
    'node-bin',
    { 'node-bin--active': isDraggableDeleteable },
    { 'node-bin--hover': hover },
  );

  return (
    <div className="drop-zone">
      <div className={classNames} />
    </div>
  );
};

NodeBin.propTypes = {
  hover: PropTypes.bool,
  isDraggableDeleteable: PropTypes.bool.isRequired,
};

NodeBin.defaultProps = {
  hover: false,
};

function mapStateToProps(state) {
  return {
    acceptsDraggableType: 'EXISTING_NODE',
    droppableName: 'NODE_BIN',
    isDraggableDeleteable: state.draggable.isDragging && state.draggable.draggableType === 'EXISTING_NODE',
  };
}

export default connect(mapStateToProps)(DropTarget(NodeBin));
