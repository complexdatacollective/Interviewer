import React, { Component } from 'react';

class Panel extends Component {

  render() {
    const {
      title,
      children
    } = this.props;

    return (
      <div className='panel'>
        <h5>{ title }</h5>
        { children }
      </div>
    );
  }
}

export default Panel;
