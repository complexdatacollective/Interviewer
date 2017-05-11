import React, { Component } from 'react';
import Draggable from '../../containers/Elements/Draggable';
import { Node } from '../../components/Elements';

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
            <Draggable key={ index } position={ { x: 0, y: 0 } } onDropped={ (hits) => handleDropNode(hits, node) }>
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
