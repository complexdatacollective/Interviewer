/* eslint-disable */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isMatch, omit } from 'lodash';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { NodeList } from '../../components/Elements';
import { makeNewNodeAttributes } from '../../selectors/interface';

/**
  * Renders an interactive list of nodes for addition to the network.
  * @extends Component
  */
class NodeProvider extends Component {
  handleSelectNode = (node) => {
    this.props.toggleNodeAttributes(node, this.props.activePromptAttributes);
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
  toggleNodeAttributes: PropTypes.func.isRequired,
};


function makeMapStateToProps() {
  const newNodeAttributes = makeNewNodeAttributes();

  return function mapStateToProps(state, props) {
    const interaction = (props.selectable && 'selectable') || (props.draggable && 'draggable') || 'none';

    return {
      activePromptAttributes: props.prompt.nodeAttributes,
      newNodeAttributes: newNodeAttributes(state, props),
      interaction,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeProvider);
