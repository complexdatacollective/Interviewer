import React, { Component } from 'react';
import classNames from 'classnames';
import { throttle } from 'lodash';

export default function scrollable(WrappedComponent) {
  class Scrollable extends Component {

    constructor() {
      super();

      this.state = { isScrolling: false };
      this.updateScrollState = throttle(this.updateScrollState, 1000 / 24);  // 24 FPS
    }

    componentDidMount() {
      if (this.node) {
        this.node.addEventListener('scroll', this.updateScrollState);
      }
    }

    componentWillUnmount() {
      if (this.node) {
        this.node.removeEventListener('scroll', this.updateScrollState);
      }
    }

    updateScrollState = () => {
      const isScrolling = this.node.scrollTop > 0;

      this.setState({ isScrolling });
    }

    render() {
      const classes = classNames('scrollable', { 'scrollable--is-scrolling': this.state.isScrolling });

      return (
        <div className={classes}>
          <div className="scrollable__window" ref={(node) => { this.node = node; }}>
            <WrappedComponent {...this.props} />
          </div>
        </div>
      );
    }
  }

  return Scrollable;
}
