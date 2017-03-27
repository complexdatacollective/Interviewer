import React, { Component } from 'react';
import { Menu } from '../components';
require('../styles/main.scss');

let MenuWrap = React.createClass({

  getInitialState() {
    return {hidden : false};
  },

  componentWillReceiveProps(nextProps) {
    const sideChanged = this.props.children.props.right !== nextProps.children.props.right;

    if (sideChanged) {
      this.setState({hidden : true});

      setTimeout(() => {
        this.show();
      }, this.props.wait);
    }
  },

  show() {
    this.setState({hidden : false});
  },

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className="right">
        {this.props.children}
      </div>
    );
  }
});

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
          <Menu pageWrapId={'page-wrap'} outerContainerId={'outer-container'} left>
              <a id="home" className="menu-item" href="/">Home</a>
              <a id="about" className="menu-item" href="/about">About</a>
              <a id="contact" className="menu-item" href="/contact">Contact</a>
          </Menu>
          <div id='page-wrap'>
            {children}
          </div>
      </div>
    );
  }
}
