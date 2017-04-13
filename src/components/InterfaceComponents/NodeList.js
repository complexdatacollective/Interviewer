import React, { Component } from 'react';
import Node from './Node';

class NodeList extends Component {
  render() {
    const {
      network
    } = this.props;

    console.log(network);

    return (
      <div className='nodelist'>
      { network.nodes.map((node, index) => {
        return <Node key={ index } { ...node } />;
      }) }
      </div>
    );
  }
}

export default NodeList;
