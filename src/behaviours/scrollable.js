import React, { Component } from 'react';
import classNames from 'classnames';
import { throttle } from 'lodash';

const maxFramesPerSecond = 10;

export default function scrollable(WrappedComponent) {
  class Scrollable extends Component {
    constructor() {
      super();

      this.state = { isScrolling: false };
      this.updateScrollState = throttle(this.updateScrollState, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      this.scrollable.addEventListener('scroll', this.updateScrollState);
    }

    componentWillUnmount() {
      this.scrollable.removeEventListener('scroll', this.updateScrollState);
    }

    updateScrollState = () => {
      const isScrolling = this.scrollable.scrollTop > 0;

      this.setState({
        isScrolling,
      });
    }

    render() {
      const classes = classNames('scrollable', { 'scrollable--is-scrolling': this.state.isScrolling });

      return (
        <div className={classes} ref={(node) => { this.scrollable = node; }}>
          <WrappedComponent {...this.props} />
        </div>
      );
    }
  }

  return Scrollable;
}
