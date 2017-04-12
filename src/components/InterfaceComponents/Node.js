import React, { Component } from 'react';

class Node extends Component {
  render() {
    const {
      firstName,
      lastName
    } = this.props;

    return (
      <div className='node'>
        <h3>{firstName} {lastName}</h3>
      </div>
    );
  }
}

export default Node;
