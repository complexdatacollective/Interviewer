import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Node, animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, selectable } from '../../behaviours';
import { DropTarget, DragSource } from '../../behaviours/DragAndDrop';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Node.
  */
const NodeList = ({
  nodes,
  nodeColor,
  label,
  selected,
  onSelectNode,
  onDragNode,
  onDropNode,
  draggableType,
  isHovered,
  isDragging,
  isPossibleTarget,
}) => {
  const classNames = cx(
    'node-list',
    { 'node-list--hover': isHovered },
    { 'node-list--drag': isDragging && isPossibleTarget }, // TODO: rename class
  );

  return (
    <StaggeredTransitionGroup
      className={classNames}
      component="div"
      delay={animation.duration.fast * 0.2}
      duration={animation.duration.slow}
      start={animation.duration.slow + 3}
      transitionName="node-list--transition"
      transitionLeave={false}
    >
      { isHovered && isPossibleTarget &&
        <Node key="placeholder" placeholder />
      }
      {
        nodes.map(node => (
          <span key={node.uid}>
            <EnhancedNode
              color={nodeColor}
              label={label(node)}
              selected={selected(node)}
              onSelected={() => onSelectNode(node)}
              onDropped={hits => onDropNode(hits, node)}
              onMove={() => onDragNode(node)}
              draggableType={draggableType}
              {...node}
            />
          </span>
        ))
      }
    </StaggeredTransitionGroup>
  );
};

NodeList.propTypes = {
  nodes: PropTypes.array.isRequired,
  nodeColor: PropTypes.string,
  onSelectNode: PropTypes.func,
  onDropNode: PropTypes.func,
  onDragNode: PropTypes.func,
  label: PropTypes.func,
  selected: PropTypes.func,
  draggableType: PropTypes.string,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isPossibleTarget: PropTypes.bool,
};

NodeList.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  selected: () => false,
  onSelectNode: () => {},
  onDropNode: () => {},
  onDragNode: () => {},
  draggableType: null,
  isHovered: false,
  isDragging: false,
  isPossibleTarget: false,
};

function mapStateToProps(state, ownProps) {
  const { isDragging, draggableType } = state.draggable;

  return {
    isHovered: state.droppable.activeZones.indexOf(ownProps.droppableName) !== -1,
    isDragging,
    isPossibleTarget: draggableType === ownProps.acceptsDraggableType,
  };
}

export default compose(
  scrollable,
  DropTarget,
  connect(mapStateToProps),
)(NodeList);
