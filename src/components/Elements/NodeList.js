import React, { Component } from 'react';
import Node from './Node';
import Touch from 'react-hammerjs';

class NodeList extends Component {
  render() {
    const {
      nodes,
      label,
      handleDrag,
      handleTap,
    } = this.props;

// <Touch onPan={handleDrag} onTap={handleTap} onClick={handleTap}>

    return (
      <div className='node-list'>
        { nodes.map((node, index) => {
          return (
            <div className='node-list__node' key={ index }>
              <Node label={ label(node) } { ...node } />
            </div>
          );
        }) }
      </div>
    );
  }
}

NodeList.defaultProps = {
  handleDrag: () => {},  // noop
  handleTap: () => {},  // noop
};

export default NodeList;
