import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { actionCreators as networkActions } from '../../ducks/modules/network';
import { activePromptAttributes, otherStagesNetwork } from '../../selectors/network';

import { InteractiveNodeList } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelectNode = (node) => {
    if (_.isMatch(node, this.props.activePromptAttributes)) {
      this.props.updateNode(_.omit(node, Object.getOwnPropertyNames(this.props.activePromptAttributes)));
    } else {
      this.props.updateNode({ ...node, ...this.props.activePromptAttributes });
    }
  }

  render() {
    const {
      interaction,
      activePromptAttributes,
      network,
    } = this.props;

    return (
      <InteractiveNodeList interaction={ interaction } network={ network } activeNodeAttributes={ activePromptAttributes } handleDragNode={ () => {} } handleSelectNode={ this.handleSelectNode } />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const interaction = ownProps.selectable && 'selectable' || ownProps.draggable && 'draggable' || 'none';

  return {
    network: ownProps.filter(otherStagesNetwork(state)),
    interaction,
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
