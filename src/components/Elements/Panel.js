import React, { Component } from 'react';

class Panel extends Component {

  render() {
    const {
      title,
      children
    } = this.props;

    return (
      <div className='panel'>
        <div className='panel__heading'><h5>{ title }</h5></div>
        <div className='panel__content'>
          { children }
        </div>
      </div>
    );
  }
}

export default Panel;
