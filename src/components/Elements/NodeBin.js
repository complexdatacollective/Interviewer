import React, { Component } from 'react';

import droppable from '../../behaviors/droppable';

class NodeBin extends Component {
  render() {
    const styles = { position: 'absolute', background: 'green', width: '100px', height: '100px', top: 0, left: 0 }
    return (
      <div className='node-bin' style={ styles } ></div>
    );
  }
}

export default droppable(NodeBin);
