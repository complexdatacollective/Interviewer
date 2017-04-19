import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import Touch from 'react-hammerjs';

import { actionCreators as networkActions } from '../../ducks/modules/network';

import { NodeList, Node } from '../../components/Elements';

class NodeProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const initalNodeState = { position: {x: 0, y: 0}, isSelected: false };

    this.setState({
      nodes: nextProps.network.nodes.map(() => { return { ...initalNodeState } })
    });
  }

  handleSelect = (node, index) => {
    const nodes = this.state.nodes;
    nodes[index].isSelected = !nodes[index].isSelected;

    this.setState({ nodes: nodes });
  }

  handleStop = (node, index, event, draggableData) => {
    // const nodes = this.state.nodes;
    // nodes[index].position = { x: draggableData.x, y: draggableData.y };
    // this.setState({ nodes: nodes });
    alert("you moved it, for now we're ignoring that");
  }

  draggableNode = (node, index) => {
    const nodeState = this.state.nodes[index];
    return (
      <Draggable key={ index } position={ nodeState.position } onStop={ (event, draggableData) => this.handleStop(node, index, event, draggableData) }>
        <Node />
      </Draggable>
    );
  }

  selectableNode = (node, index) => {
    const nodeState = this.state.nodes[index];
    return (
      <Touch key={ index } onTap={ () => this.handleSelect(node) } onClick={ () => this.handleSelect(node, index) }>
        <Node isSelected={ nodeState.isSelected } />
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
