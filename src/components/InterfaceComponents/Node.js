import React, { Component } from 'react';

class Node extends Component {
  render() {
    return (
      <div className='node'>
        <h3>{this.props.fName} {this.props.lName}</h3>
      </div>
    );
  }
}

export default Node;
