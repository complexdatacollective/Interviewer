import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Node, animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable, draggable, selectable } from '../../behaviours';

const EnhancedNode = draggable(selectable(Node));

/**
  * Renders a list of Node.
  */
const NodeList = ({
  nodes,
  nodeColor,
  label,
  selected,
  handleSelectNode,
  handleDropNode,
  draggableType,
  hover,
  isDragging,
}) => {
  const classNames = cx(
    'node-list',
    { 'node-list--hover': hover },
    { 'node-list--drag': isDragging },
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
      { hover &&
        <Node key="placeholder" placeholder />
      }
      {
        nodes.map(node => (
          <span key={node.uid}>
            <EnhancedNode
              color={nodeColor}
              label={label(node)}
              selected={selected(node)}
              onSelected={() => handleSelectNode(node)}
              onDropped={hits => handleDropNode(hits, node)}
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
  handleSelectNode: PropTypes.func,
  handleDropNode: PropTypes.func,
  label: PropTypes.func,
  selected: PropTypes.func,
  draggableType: PropTypes.string,
  hover: PropTypes.bool,
  isDragging: PropTypes.bool.isRequired,
};

NodeList.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  selected: () => false,
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
  hover: false,
};

function mapStateToProps(state, ownProps) {
  return {
    isDragging: state.draggable.isDragging &&
      state.draggable.draggableType === ownProps.acceptsDraggableType,
  };
}

export default connect(mapStateToProps)(droppable(scrollable(NodeList)));
