import React, { Component } from 'react';

class Node extends Component {
  render() {
    const {
      label
    } = this.props;

    return (
      <div className='node'>
        <h3>{ label }</h3>
      </div>
    );
  }
}

export default Node;
