import React, { Component } from 'react';

class Node extends Component {
  render() {
    const {
      label
    } = this.props;

    return (
      <div className='node' >
        <h3>{ label }</h3>
      </div>
    );
  }
}

Node.defaultProps = {
  label: 'Node',
};

export default Node;
