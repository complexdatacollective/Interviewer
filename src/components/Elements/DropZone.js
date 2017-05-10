import React, { Component } from 'react';

import droppable from '../../behaviors/droppable';

class DropZone extends Component {
  render() {
    return (
      <div className='drop-zone' ></div>
    );
  }
}

export default droppable(DropZone);
