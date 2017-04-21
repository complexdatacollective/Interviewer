import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import Touch from 'react-hammerjs';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { NodeList, Node } from '../../components/Elements';

import { diff, nodeIncludesAttributes } from '../../utils/Network';

class NodeProvider extends Component {
  constructor(props) {
    super(props);
  }

  handleSelect = (nodeId) => {
    // do something with node
    this.handleAction(nodeId);
  }

  handleStop = (nodeId) => {
    // do something with node
    this.handleAction(nodeId);
  }

  handleAction(nodeId) {
    console.log(`interacted with ${nodeId}`);
  }

  draggableNode = (node, nodeId) => {
    return (
      <Draggable key={ nodeId } position={ { x: 0, y: 0 } } onStop={ () => this.handleStop(nodeId) }>
        <Node { ...node } label={ `${node.nickname}` } />
      </Draggable>
    );
  }

  selectableNode = (node, nodeId) => {
    return (
      <Touch key={ nodeId } onTap={ () => this.handleSelect(node) } onClick={ () => this.handleSelect(nodeId) }>
        <Node { ...node } label={ `${node.nickname}` } />
      </Touch>
    );
  }

  render() {
    const {
      network,
      interaction,
    } = this.props;

    const mapNodes = (nodes, interaction) => {
      switch(interaction) {
        case 'selectable':
          return nodes.map(this.draggableNode);
        case 'draggable':
          return nodes.map(this.selectableNode);
        default:
          return nodes.map((node, index) => {
            <Node key={ index } {...node } />
          });
      }
    }

    let nodes = mapNodes(network.nodes, interaction);

    return (
      <div class='node-provider'>
        <NodeList>
          { nodes }
        </NodeList>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let interaction = ownProps.selectable && 'selectable' || ownProps.draggable && 'draggable' || 'none';

  return {
    network: diff(state.network, nodeIncludesAttributes(state.network, ownProps.activeNodeAttributes)),
    interaction
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
