import React from 'react';
import PropTypes from 'prop-types';
import { isMatch } from 'lodash';
import { NodeList } from '../../components/Elements';

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
function interactableNodeList(WrappedComponent) {
  return function InteractionNodeList(props) {
    InteractionNodeList.propTypes = {
      activePromptAttributes: PropTypes.object.isRequired,
      interaction: PropTypes.string.isRequired,
    };

    const {
      activePromptAttributes,
      interaction,
    } = props;

    const selected = node => isMatch(node, activePromptAttributes);

    switch (interaction) {
      case 'selectable':
        return (
          <WrappedComponent
            draggableType="EXISTING_NODE"
            selected={selected}
            {...props}
          />
        );
      case 'droppable':
        return (
          <WrappedComponent
            draggableType="NEW_NODE"
            droppableName="NODE_PROVIDER"
            acceptsDraggableType="EXISTING_NODE"
            {...props}
          />
        );
      default:
        return (
          <WrappedComponent
            draggableType="NEW_NODE"
            {...props}
          />
        );
    }
  };
}

const NodeProvider = interactableNodeList(NodeList);
export default NodeProvider;
