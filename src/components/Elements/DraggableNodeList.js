import React, { Component } from 'react';
import draggable from '../../behaviors/draggable';
import { Node } from '../../components/Elements';

const DraggableNode = draggable(Node);

class DraggableNodeList extends Component {
  render() {
    const {
      network,
      handleDropNode,
    } = this.props;

    return (
      <div className='node-list node-list--draggable'>
        { network.nodes.map((node, index) => {
          return (
            <DraggableNode key={ index } onDropped={ (hits) => handleDropNode(hits, node) } label={ `${node.nickname}` } { ...node } />
          );
        }) }
      </div>
    );
  }
}

export default DraggableNodeList;
