import React, { Component } from 'react';
import Draggable from 'react-draggable';

class Node extends Component {
  render() {
    const {
      label
    } = this.props;

    return (
      <Draggable
      defaultPosition={{x: 0, y: 0}}
      position={null}
      zIndex={100}>
        <div className='node'>
          <h3>{ label }</h3>
        </div>
      </Draggable>
    );
  }
}

export default Node;
