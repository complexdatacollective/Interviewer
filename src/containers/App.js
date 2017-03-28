import React, { Component } from 'react';
import { Menu } from '../components';
import { Link } from 'react-router';
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
          <Menu>
            <Link to='protocol'>Access sample protocol</Link>
            <Link to='protocol'>Access sample protocol</Link>
            <Link to='protocol'>Access sample protocol</Link>
            <Link to='protocol'>Access sample protocol</Link>
          </Menu>
          <div id='page-wrap' className="">
            {children}
          </div>
      </div>
    );
  }
}
