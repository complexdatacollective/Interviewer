import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { Node } from '../../components/Elements';

class DraggableNodeList extends Component {
  render() {
    const {
      network,
      handleDragNode,
    } = this.props;

    return (
      <div class='node-list node-list--draggable'>
        { network.nodes.map((node, index) => {
          return (
            <Draggable key={ index } position={ { x: 0, y: 0 } } onStop={ () => handleDragNode(node) }>
              <div>
                <Node { ...node } label={ `${node.nickname}` } />
              </div>
            </Draggable>
          );
        }) }
      </div>
    );
  }
}

export default DraggableNodeList;
