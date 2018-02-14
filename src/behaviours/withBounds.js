/* eslint-disable react/no-find-dom-node */

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

      this.throttledTrackSize = throttle(this.trackSize.bind(this), 1000 / maxUpdatesPerSecond);
    }

    componentDidMount() {
      this.trackSize();
    }

    componentWillUnmount() {
      this.throttledTrackSize.cancel();
    }

    trackSize() {
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

      this.throttledTrackSize();
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
