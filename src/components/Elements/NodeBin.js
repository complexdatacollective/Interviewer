import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DropZone } from '../../components/Elements';

/**
  * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
  */
const NodeBin = (props) => {
  if (!props.isDraggableDeleteable) { return null; }

  return (
    <div className="name-generator__node-bin">
      <DropZone droppableName="NODE_BIN" acceptsDraggableType="EXISTING_NODE" />
    </div>
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
