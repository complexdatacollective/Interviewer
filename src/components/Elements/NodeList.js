import React, { Component } from 'react';
import { Node } from '../Elements';
import { scrollable, droppable, draggable, selectable } from '../../behaviors';

const EnhancedNode = draggable(selectable(Node));

class NodeList extends Component {
  render() {
    const {
      network,
      label,
      isActive,
      activeNodeAttributes,
      handleSelectNode,
      handleDropNode,
      draggableType,
    } = this.props;

    return (
      <div className='node-list'>
        { network.nodes.map((node, index) => {
          return <EnhancedNode key={ index } label={ label(node) } isActive={ isActive(node) } activeNodeAttributes={ activeNodeAttributes } onSelected={ () => handleSelectNode(node) } onDropped={ (hits) => handleDropNode(hits, node) } draggableType={ draggableType } { ...node } />;
        }) }
      </div>
    );
  }
}

NodeList.defaultProps = {
  isActive: () => {},
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
};


export default droppable(scrollable(NodeList));
