import React, { Component } from 'react';

class NodeList extends Component {
  render() {
    return (
      <div className='node-list'>
        { this.props.children }
      </div>
    );
  }
}

export default NodeList;
