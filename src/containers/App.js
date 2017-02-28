import React, { Component } from 'react';

require('semantic-ui-css/semantic.min.css');
require('../styles/main.scss');

export default class App extends Component {
  render() {
    let children = null;
    if (this.props.children) {
      children = React.cloneElement(this.props.children, {
        authService: this.props.route.authService,
        networkService: this.props.route.networkService
      })
    }
    return (
      <div className='app__container'>
        {children}
      </div>
    );
  }
}
