import React, { Component } from 'react';
import { StageMenu } from '.';
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
      <div id='outer-container'>
          <StageMenu />
          <div id='page-wrap' className="">
            {children}
          </div>
      </div>
    );
  }
}
