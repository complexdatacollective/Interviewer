import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isMatch, omit } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { NodeList } from '../../components/Elements';

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodeProvider extends Component {
  handleSelectNode = (node) => {
    if (isMatch(node, this.props.activePromptAttributes)) {
      this.props.updateNode(
        omit(node, Object.getOwnPropertyNames(this.props.activePromptAttributes)),
      );
    } else {
      this.props.updateNode({ ...node, ...this.props.activePromptAttributes });
    }
  }

  handleDropNode = (hits, node) => {
    hits.forEach((hit) => {
      switch (hit.name) {
        case 'MAIN_NODE_LIST':
          this.props.addNode({ ...this.props.newNodeAttributes, ...node });
          break;
        case 'NODE_BIN':
          this.props.removeNode(node.uid);
          break;
        default:
      }
    });
  }

  render() {
    const {
      interaction,
      nodes,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, this.props.activePromptAttributes);

    switch (interaction) {
      case 'selectable':
        return (
          <NodeList
            nodes={nodes}
            label={label}
            draggableType="EXISTING_NODE"
            handleDropNode={this.handleDropNode}
            handleSelectNode={this.handleSelectNode}
            selected={selected}
          />
        );
      default:
        return (
          <NodeList
            nodes={nodes}
            label={label}
            draggableType="NEW_NODE"
            handleDropNode={this.handleDropNode}
          />
        );
    }
  }
}

NodeProvider.propTypes = {
  newNodeAttributes: PropTypes.object.isRequired,
  activePromptAttributes: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  interaction: PropTypes.string.isRequired,
  addNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  const interaction = (props.selectable && 'selectable') || (props.draggable && 'draggable') || 'none';

  const newNodeAttributes = {
    type: props.config.params.nodeType,
    stageId: props.config.id,
    promptId: props.prompt.id,
    ...props.prompt.nodeAttributes,
  };

  return {
    activePromptAttributes: props.prompt.nodeAttributes,
    newNodeAttributes,
    interaction,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
