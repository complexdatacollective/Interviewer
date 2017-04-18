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

    return (
      <div className='node-list'>
      { nodes.map((node, index) => {
        return (
          <Touch onPan={handleDrag} onTap={handleTap} onClick={handleTap} key={ index }>
            <Node label={ label(node) } { ...node } />
          </Touch>
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
