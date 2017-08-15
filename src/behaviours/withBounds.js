/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { throttle } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';

const maxFramesPerSecond = 10;

export default function withBounds(WrappedComponent) {
  return class extends Component {
    constructor() {
      super();

      this.state = {
        width: 0,
        height: 0,
        y: 0,
        x: 0,
      };

      this.trackSize = throttle(this.trackSize, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      this.trackSize();
      window.addEventListener('resize', this.trackSize);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.trackSize);
    }

    trackSize = () => {
      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      this.setState({
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          ref={(component) => { this.node = findDOMNode(component); }}
        />
      );
    }
  };
}
