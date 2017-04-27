import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import Touch from 'react-hammerjs';
import _, { filter } from 'lodash';

import { Node } from '../../components/Elements';

import { actionCreators as droppableActions } from '../../ducks/modules/droppable';

class InteractiveNodeList extends Component {

  dropped = (event) => {
    const wrap = document.getElementById('page-wrap');
    const y = event.y + wrap.scrollTop;
    const x = event.x;
    this.props.updateZone({
      name: 'preview',
      width: 100,
      height: 100,
      top: y,
      left: x,
    })

    // const hits = filter(this.props.zones, (zone) => {
    //   return x > zone.left && x < zone.left + zone.width && y > zone.top && y < zone.top + zone.height
    // });
    //
    // console.log(this.props.zones, {x, y});
  }

  draggableNode = (node, index) => {
    return (
      <Draggable key={ index } position={ { x: 0, y: 0 } } onStop={ this.dropped } >
        <div>
          <Node { ...node } label={ `${node.nickname}` } />
        </div>
      </Draggable>
    );
  }

  selectableNode = (node, index) => {
    const isActive = _.isMatch(node, this.props.activeNodeAttributes);

    return (
      <Touch key={ index } onTap={ () => this.props.handleSelectNode(node) } >
        <Node { ...node } label={ `${node.nickname}` } isActive={ isActive } />
      </Touch>
    );
  }

  render() {
    const {
      network,
      interaction,
    } = this.props;

    const mapNodes = (nodes, interaction) => {
      switch (interaction) {
        case 'selectable':
          return nodes.map(this.selectableNode);
        case 'draggable':
          return nodes.map(this.draggableNode);
        default:
          return nodes.map((node, index) => {
            <Node key={ index } { ...node } />
          });
      }
    }

    let nodes = mapNodes(network.nodes, interaction);

    return (
      <div class='node-list node-list--interactive'>
        { nodes }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    zones: state.droppable.zones,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateZone: bindActionCreators(droppableActions.updateZone, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InteractiveNodeList);
