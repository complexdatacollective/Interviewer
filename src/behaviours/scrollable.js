import React, { Component } from 'react';
import classNames from 'classnames';
import { throttle } from 'lodash';

const maxFramesPerSecond = 10;

const scrollable = WrappedComponent =>
  class Scrollable extends Component {
    constructor() {
      super();

      this.state = { isScrolling: false };
      this.updateScrollState = throttle(this.updateScrollState, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      this.el.addEventListener('scroll', this.updateScrollState);
    }

    componentWillUnmount() {
      this.el.removeEventListener('scroll', this.updateScrollState);
    }

    updateScrollState = () => {
      this.setState({
        isScrolling: this.isScrolling(),
      });
    }

    isScrolling = () => {
      const scrollTop = this.scrollTop();
      return scrollTop && scrollTop > 0;
    }

    scrollTop = (pixels = null) => {
      if (!this.el) { return null; }
      if (pixels !== null) { this.el.scrollTop = pixels; }
      return this.el.scrollTop;
    }

    render() {
      const classes = classNames('scrollable', { 'scrollable--is-scrolling': this.state.isScrolling });

      return (
        <div className={classes} ref={(el) => { this.el = el; }}>
          <WrappedComponent {...this.props} scrollTop={this.scrollTop} />
        </div>
      );
    }
  };

export default scrollable;
