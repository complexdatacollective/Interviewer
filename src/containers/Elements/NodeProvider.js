import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isMatch, omit } from 'lodash';

import { actionCreators as networkActions } from '../../ducks/modules/network';
import { newNodeAttributes, activePromptAttributes } from '../../selectors/session';

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
      network,
    } = this.props;

    const label = node => `${node.nickname}`;
    const selected = node => isMatch(node, this.props.activePromptAttributes);

    switch (interaction) {
      case 'selectable':
        return (
          <NodeList
            network={network}
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
            network={network}
            label={label}
            draggableType="NEW_NODE"
            handleDropNode={this.handleDropNode}
          />
        );
    }
  }
}

NodeProvider.propTypes = {
  activePromptAttributes: PropTypes.object.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  network: PropTypes.object.isRequired,
  interaction: PropTypes.string.isRequired,
  addNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  const interaction = (ownProps.selectable && 'selectable') || (ownProps.draggable && 'draggable') || 'none';

  return {
    interaction,
    newNodeAttributes: newNodeAttributes(state),
    activePromptAttributes: activePromptAttributes(state),
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
