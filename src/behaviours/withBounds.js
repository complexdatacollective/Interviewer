import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { throttle, isEqual } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';

const maxUpdatesPerSecond = 6;

const initialState = {
  width: 0,
  height: 0,
  y: 0,
  x: 0,
};

export default function withBounds(WrappedComponent) {
  return class extends Component {
    constructor() {
      super();

      this.state = initialState;
      this.lastState = initialState;

      this.trackSize = throttle(this.trackSize, 1000 / maxUpdatesPerSecond);
    }

    componentDidMount() {
      this.trackSize();
    }

    componentWillUnmount() {
      window.cancelAnimationFrame(this.animationRequestId);
    }

    trackSize = () => {
      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      const nextState = {
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      };

      if (!isEqual(this.lastState, nextState)) {
        this.lastState = nextState;
        this.setState(nextState);
      }

      this.animationRequestId = window.requestAnimationFrame(this.trackSize);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          ref={() => { this.node = findDOMNode(this); }}
        />
      );
    }
  };
}
