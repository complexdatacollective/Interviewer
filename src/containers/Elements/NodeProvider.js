import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import Touch from 'react-hammerjs';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { NodeList, Node } from '../../components/Elements';

class NodeProvider extends Component {
  handleSelect = (node) => {
    console.log('handle Select', node);
  }

  handleStop = (node, event) => {
    console.log('handle stop', node, event);
  }

  draggableNode = (node, index) => {
    return (
      <Draggable key={ index } onStop={ (event) => this.handleStop(node, event) }>
        <Node />
      </Draggable>
    );
  }

  selectableNode = (node, index) => {
    return (
      <Touch key={ index } onTap={ () => this.handleSelect(node) } onClick={ () => this.handleSelect(node) }>
        <Node />
      </Touch>
    );
  }

  regularNode = (node, index) => {
    return (
      <Node key={ index } />
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
          return nodes.map(this.regularNode);
      }
    }

    let nodes = mapNodes(network.nodes, interaction);

    return (
      <div class='node-provider'>
        Draggable Provider
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
    network: state.network,
    interaction
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeProvider);
