import React, { Component } from 'react';
import { Node } from '../Elements';
import Droppable from '../../containers/Elements/Droppable';

class NodeList extends Component {
  render() {
    const {
      network: {
        nodes
      }
    } = this.props;

    return (
      <Droppable name="nodelist">
        <div className='node-list'>
          { nodes.map((node, index) => {
            const label = `${node.nickname}`;
            return <Node key={ index } label={ label } />;
          }) }
        </div>
      </Droppable>
    );
  }
}

export default NodeList;
