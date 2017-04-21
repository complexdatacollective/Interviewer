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

  handleSelect = (node) => {
    // do something with node
    this.handleAction(node);
  }

  handleStop = (nodeId, node) => {
    // do something with node
    this.handleAction(node);
  }

  handleAction(node) {
    const {
      source,
      activeNodeAttributes,
      updateNode,
    } = this.props;

    const updatedNode = { ...node, ...activeNodeAttributes };

    console.log('updateNode', source, node, updatedNode);

    switch(source) {
      case 'existing':
        updateNode(updatedNode);
    }
  }

  draggableNode = (node, index) => {
    return (
      <Draggable key={ index } position={ { x: 0, y: 0 } } onStop={ () => this.handleStop(node) }>
        <div>
          <Node { ...node } label={ `${node.nickname}` } />
        </div>
      </Draggable>
    );
  }

  selectableNode = (node, index) => {
    return (
      <Touch key={ index } onTap={ () => this.handleSelect(node) } >
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
          return nodes.map(this.selectableNode);
        case 'draggable':
          return nodes.map(this.draggableNode);
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
    interaction,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
