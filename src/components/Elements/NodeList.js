import React from 'react';
import PropTypes from 'prop-types';
import { Node } from '../Elements';
import { scrollable, droppable, draggable, selectable } from '../../behaviors';

const EnhancedNode = draggable(selectable(Node));

/**
  * Renders a list of Node.
  */
const NodeList = (props) => {
  const {
    network,
    label,
    isActive,
    handleSelectNode,
    handleDropNode,
    draggableType,
  } = props;

  return (
    <div className="node-list">
      {
        network.nodes.map((node, index) => (
          <EnhancedNode
            key={index}
            label={label(node)}
            isActive={isActive(node)}
            onSelected={() => handleSelectNode(node)}
            onDropped={hits => handleDropNode(hits, node)}
            draggableType={draggableType}
            {...node}
          />
        ))
      }
    </div>
  );
};

NodeList.propTypes = {
  network: PropTypes.any.isRequired,
  handleSelectNode: PropTypes.func,
  handleDropNode: PropTypes.func,
  label: PropTypes.func,
  isActive: PropTypes.func,
  draggableType: PropTypes.string,
};

NodeList.defaultProps = {
  label: () => {},
  isActive: () => false,
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
};

export default droppable(scrollable(NodeList));
