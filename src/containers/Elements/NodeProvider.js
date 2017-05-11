import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { actionCreators as networkActions } from '../../ducks/modules/network';
import { newNodeAttributes, activePromptAttributes } from '../../selectors/session';
import { filteredDataSource } from '../../selectors/dataSource';

import { NodeList, SelectableNodeList, DraggableNodeList } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelectNode = (node) => {
    if (_.isMatch(node, this.props.activePromptAttributes)) {
      this.props.updateNode(_.omit(node, Object.getOwnPropertyNames(this.props.activePromptAttributes)));
    } else {
      this.props.updateNode({ ...node, ...this.props.activePromptAttributes });
    }
  }

  handleDropNode = (hits, node) => {
    this.props.addNode({ ...this.props.newNodeAttributes, ...node });
  }

  render() {
    const {
      interaction,
      activePromptAttributes,
      network,
    } = this.props;

    switch (interaction) {
      case 'selectable':
        return <SelectableNodeList network={ network } activeNodeAttributes={ activePromptAttributes } handleSelectNode={ this.handleSelectNode } />;
      case 'draggable':
        return <DraggableNodeList network={ network } activeNodeAttributes={ activePromptAttributes } handleDropNode={ this.handleDropNode } />;
      default:
        return <NodeList network={ network } />;
    }
  }
}

function mapStateToProps(state, ownProps) {
  const interaction = ownProps.selectable && 'selectable' || ownProps.draggable && 'draggable' || 'none';

  return {
    network: filteredDataSource(state, ownProps),
    interaction,
    newNodeAttributes: newNodeAttributes(state),
    activePromptAttributes: activePromptAttributes(state),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
