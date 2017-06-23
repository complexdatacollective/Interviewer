import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DropZone } from '../../components/Elements';

/**
  * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
  */
const NodeBin = ({ isDraggableDeleteable }) => {
  const classNames = cx(
    'node-bin',
    { 'node-bin--active': isDraggableDeleteable },
  );

  return (
    <DropZone droppableName="NODE_BIN" acceptsDraggableType="EXISTING_NODE">
      <div className={classNames} />
    </DropZone>
  );
};

NodeBin.propTypes = {
  isDraggableDeleteable: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    isDraggableDeleteable: state.draggable.isDragging && state.draggable.draggableType === 'EXISTING_NODE',
  };
}

export default connect(mapStateToProps)(NodeBin);
