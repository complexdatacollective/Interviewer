import React, { Component } from 'react';
import Scrollable from '../../containers/Elements/Scrollable';

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
          <Scrollable>
            { children }
          </Scrollable>
        </div>
      </div>
    );
  }
}

export default Panel;
