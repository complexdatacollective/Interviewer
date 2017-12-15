/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { actionCreators as actions } from './reducer';
import store from './store';

const maxFramesPerSecond = 10;

const dropTarget = WrappedComponent =>
  class DropTarget extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      onDrop: PropTypes.func,
      onDrag: PropTypes.func,
      accepts: PropTypes.func,
      meta: PropTypes.func,
    }

    static defaultProps = {
      meta: () => ({}),
      accepts: () => false,
      onDrop: () => {},
      onDrag: () => {},
    }

    constructor(props) {
      super(props);

      this.onResize = throttle(this.onResize, 1000 / maxFramesPerSecond);
      window.addEventListener('resize', this.onResize);
      this.interval = setInterval(this.updateTarget, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      if (!this.component) { return; }
      this.node = findDOMNode(this.component);
      this.updateTarget();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
      this.onResize.cancel();
      this.removeTarget();
      clearInterval(this.interval);
    }

    onResize = () => {
      this.updateTarget();
      setTimeout(this.updateTarget, 1000);
    }

    removeTarget = () => {
      store.dispatch(
        actions.removeTarget(this.props.id),
      );
    }

    updateTarget = () => {
      if (!this.node) { return; }

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        actions.updateTarget({
          id: this.props.id,
          onDrop: this.props.onDrop,
          onDrag: this.props.onDrag,
          accepts: this.props.accepts,
          meta: this.props.meta(),
          width: boundingClientRect.width,
          height: boundingClientRect.height,
          y: boundingClientRect.top,
          x: boundingClientRect.left,
        }),
      );
    }

    render() {
      const {
        accepts,
        meta,
        ...props
      } = this.props;

      return (
        <WrappedComponent
          ref={(component) => { this.component = component; }}
          {...props}
        />
      );
    }
  };

export default dropTarget;
