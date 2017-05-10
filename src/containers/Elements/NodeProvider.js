import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _, { isMatch } from 'lodash';

import { actionCreators as networkActions } from '../../ducks/modules/network';
import { newNodeAttributes, activePromptAttributes } from '../../selectors/session';
import { filteredDataSource } from '../../selectors/dataSource';

import { NodeList } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelectNode = (node) => {
    if (_.isMatch(node, this.props.activePromptAttributes)) {
      this.props.updateNode(_.omit(node, Object.getOwnPropertyNames(this.props.activePromptAttributes)));
    } else {
      this.props.updateNode({ ...node, ...this.props.activePromptAttributes });
    }
  }

  handleDropNode = (hits, node) => {
    hits.map((hit) => {
      switch (hit.name) {
        case 'MAIN_NODE_LIST':
          return this.props.addNode({ ...this.props.newNodeAttributes, ...node });
        case 'NODE_BIN':
          return this.props.removeNode(node.uid);
      }
    });
  }

  render() {
    const {
      interaction,
      activePromptAttributes,
      network,
    } = this.props;

    const label = (node) => `${node.nickname}`;
    const isActive = (node) => isMatch(node, activePromptAttributes);

    switch (interaction) {
      case 'selectable':
        return <NodeList network={ network } label={ label } draggableType='EXISTING_NODE' handleDropNode={ this.handleDropNode } handleSelectNode={ this.handleSelectNode } isActive={ isActive } />;
      default:
        return <NodeList network={ network } label={ label } draggableType='NEW_NODE' handleDropNode={ this.handleDropNode } />;
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
    removeNode: bindActionCreators(networkActions.removeNode, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
