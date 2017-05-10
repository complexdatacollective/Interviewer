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
      dropType,
    } = this.props;

    return (
      <div className='node-list'>
        { network.nodes.map((node, index) => {
          return <EnhancedNode key={ index } label={ label(node) } isActive={ isActive(node) } activeNodeAttributes={ activeNodeAttributes } onSelect={ () => handleSelectNode(node) } onDrop={ (hits) => handleDropNode(hits, node) } dropType={ dropType }  { ...node } />;
        }) }
      </div>
    );
  }
}

NodeList.defaultProps = {
  isActive: () => {},
  handleSelectNode: () => {},
  handleDropNode: () => {},
  dropType: '',
};


export default droppable(scrollable(NodeList));
