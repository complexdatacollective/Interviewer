import React, { Component } from 'react';
// import { connect } from 'react-redux';

class Node extends Component {
  render() {
    const {
      fName,
      lName
    } = this.props;

    return (
      <div className='node-object'>
        <h3>{fName} {lName}</h3>
      </div>
    );
  }
}

export default Node;
