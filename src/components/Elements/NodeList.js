import React, { Component } from 'react';
import { Node } from '../Elements';
import droppable from '../../behaviors/droppable';

class NodeList extends Component {
  render() {
    const {
      network: {
        nodes
      }
    } = this.props;

    return (
      <div className='node-list'>
        { nodes.map((node, index) => {
          const label = `${node.nickname}`;
          return <Node key={ index } label={ label } />;
        }) }
      </div>
    );
  }
}

export default droppable(NodeList);
