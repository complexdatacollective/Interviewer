import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { InteractiveNodeList } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelectNode = () => {
    console.log('do nothing 1');
  }

  handleDragNode = () => {
    console.log('do nothing 2');
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
    } = this.props;

    return (
      <InteractiveNodeList interaction={ interaction } network={ this.network() } handleDragNode={ this.handleDragNode } handleSelectNode={ this.handleSelectNode } />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const interaction = ownProps.selectable && 'selectable' || ownProps.draggable && 'draggable' || 'none';

  return {
    network: state.network,
    interaction,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default  connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
