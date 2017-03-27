import React, { Component } from 'react';
// import { connect } from 'react-redux';

class Node extends Component {
  render() {
    const {
      name
    } = this.props;

    return (
      <div className='node-object'>
        <h3>test - {name}</h3>
      </div>
    );
  }
}

export default Node;
