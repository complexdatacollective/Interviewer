import React, { Component } from 'react';

class NodeList extends Component {
  render() {
    const {
      network
    } = this.props;

    return (
      <div className='nodelist'>
        { network.nodes.map(node => {
          return <Node firstName={ node.firstName } lastName={ node.lastName } />;
        }) }
      </div>
    );
  }
}

export default NodeList;
