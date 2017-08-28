import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable, draggable, selectable } from '../../behaviours';
import Node from './Node';

const EnhancedNode = draggable(selectable(Node));

/**
  * Renders a list of Node.
  */
const NodeList = ({
  nodes,
  label,
  selected,
  handleSelectNode,
  handleDropNode,
  draggableType,
  hover,
}) => {
  const classNames = cx(
    'node-list',
    { 'node-list--hover': hover },
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
  handleSelectNode: PropTypes.func,
  handleDropNode: PropTypes.func,
  label: PropTypes.func,
  selected: PropTypes.func,
  draggableType: PropTypes.string,
  hover: PropTypes.bool,
};

NodeList.defaultProps = {
  nodes: [],
  label: () => (''),
  selected: () => false,
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
  hover: false,
};

export default droppable(scrollable(NodeList));
