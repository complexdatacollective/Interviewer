/* eslint-disable react/no-find-dom-node, react/jsx-props-no-spreading */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { actionCreators as actions } from './reducer';
import store from './store';
import { maxFramesPerSecond } from './DropTarget';

const dropObstacle = (WrappedComponent) => class DropObstacle extends Component {
  componentDidMount() {
    if (!this.component) { return; }
    this.node = findDOMNode(this.component);
    this.update();
  }

  componentWillUnmount() {
    this.removeObstacle();
    clearTimeout(this.interval);
    cancelAnimationFrame(this.animationFrame);
  }

  removeObstacle = () => {
    const { id } = this.props;
    store.dispatch(
      actions.removeObstacle(id),
    );
  }

  update = () => {
    this.updateObstacle();

    this.interval = setTimeout(
      () => {
        this.animationFrame = requestAnimationFrame(this.update);
      },
      1000 / maxFramesPerSecond,
    );
  }

  updateObstacle = () => {
    if (!this.node) { return; }

    const { id } = this.props;

    const boundingClientRect = getAbsoluteBoundingRect(this.node);

    store.dispatch(
      actions.upsertObstacle({
        id,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      }),
    );
  }

  render() {
    return (
      <WrappedComponent
        ref={(component) => { this.component = component; }}
        {...this.props}
      />
    );
  }
};

dropObstacle.propTypes = {
  id: PropTypes.string.isRequired,
};

export default dropObstacle;
