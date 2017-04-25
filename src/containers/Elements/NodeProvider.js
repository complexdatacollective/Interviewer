import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { InteractiveNodeList } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelectNode = (node) => {
    if (_.isMatch(node, this.props.activeNodeAttributes)) {
      this.props.updateNode(_.omit(node, Object.getOwnPropertyNames(this.props.activeNodeAttributes)));
    } else {
      this.props.updateNode({ ...node, ...this.props.activeNodeAttributes });
    }
  }

  network = () => {
    const {
      filter,
      network,
    } = this.props;

    return filter(network);
  }

  render() {
    const {
      interaction,
      activeNodeAttributes,
    } = this.props;

    return (
      <InteractiveNodeList interaction={ interaction } network={ this.network() } activeNodeAttributes={ activeNodeAttributes } handleDragNode={ () => {} } handleSelectNode={ this.handleSelectNode } />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const interaction = ownProps.selectable && 'selectable' || ownProps.draggable && 'draggable' || 'none';

  const {
    type,
    stageId,
    ...activeNodeAttributes,
  } = ownProps.newNodeAttributes;

  return {
    network: state.network,
    interaction,
    activeNodeAttributes,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  }
}

export default  connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
