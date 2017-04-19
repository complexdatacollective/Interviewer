import React, { Component } from 'react';

class Panels extends Component {

  render() {
    return (
      <div className='panels'>
        { this.props.children }
      </div>
    );
  }
}

export default Panels;
