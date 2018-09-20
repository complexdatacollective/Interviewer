/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
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
      onDragEnd: PropTypes.func,
      accepts: PropTypes.func,
      meta: PropTypes.func,
    }

    static defaultProps = {
      meta: () => ({}),
      accepts: () => false,
      onDrop: () => {},
      onDrag: () => {},
      onDragEnd: () => {},
    }

    componentDidMount() {
      if (!this.component) { return; }
      this.node = findDOMNode(this.component);
      this.update();
    }

    componentWillUnmount() {
      this.removeTarget();
      clearTimeout(this.interval);
      cancelAnimationFrame(this.animationFrame);
    }

    removeTarget = () => {
      store.dispatch(
        actions.removeTarget(this.props.id),
      );
    }

    update = () => {
      this.updateTarget();

      this.interval = setTimeout(
        () => {
          this.animationFrame = requestAnimationFrame(this.update);
        },
        1000 / maxFramesPerSecond,
      );
    }

    updateTarget = () => {
      if (!this.node) { return; }

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        actions.upsertTarget({
          id: this.props.id,
          onDrop: this.props.onDrop,
          onDrag: this.props.onDrag,
          onDragEnd: this.props.onDragEnd,
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
