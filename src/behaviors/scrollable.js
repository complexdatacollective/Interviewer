import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { throttle } from 'lodash';

export default function scrollable(WrappedComponent) {
  class Scrollable extends Component {

    constructor() {
      super();

      this.state = { isScrolling: false };
      this.updateScrollState = throttle(this.updateScrollState, 1000/24);  // 24 FPS
    }

    componentWillUnmount() {
      this.el.removeEventListener('scroll', this.updateScrollState);
    }

    componentDidMount() {
      this.el = ReactDOM.findDOMNode(this).querySelector('[data-scrollable-window]');
      this.el.addEventListener('scroll', this.updateScrollState);
    }

    updateScrollState = () => {
      const isScrolling = this.el.scrollTop > 0 ? true : false;

      this.setState({
        isScrolling: isScrolling,
      })
    }

    render() {
      const classes = classNames('scrollable', { 'scrollable--is-scrolling': this.state.isScrolling });

      return (
        <div className={ classes }>
          <div className="scrollable__window" data-scrollable-window>
            <WrappedComponent {...this.props } />
          </div>
        </div>
      );
    }
  }

  return Scrollable;
}
