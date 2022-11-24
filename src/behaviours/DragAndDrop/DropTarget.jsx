/* eslint-disable react/no-find-dom-node, react/jsx-props-no-spreading */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { actionCreators as actions } from './reducer';
import store from './store';

const maxFramesPerSecond = 10;

const dropTarget = (WrappedComponent) => {
  class DropTarget extends Component {
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
      const { id } = this.props;
      store.dispatch(
        actions.removeTarget(id),
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

      const {
        id,
        onDrop,
        onDrag,
        onDragEnd,
        accepts,
        meta,
      } = this.props;

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        actions.upsertTarget({
          id,
          onDrop,
          onDrag,
          onDragEnd,
          accepts,
          meta: meta(),
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
  }

  DropTarget.propTypes = {
    id: PropTypes.string.isRequired,
    onDrop: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    accepts: PropTypes.func,
    meta: PropTypes.func,
  };

  DropTarget.defaultProps = {
    meta: () => ({}),
    accepts: () => false,
    onDrop: () => {},
    onDrag: () => {},
    onDragEnd: () => {},
  };

  return DropTarget;
};

export default dropTarget;

export { maxFramesPerSecond };
