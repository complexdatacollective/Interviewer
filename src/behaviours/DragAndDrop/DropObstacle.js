/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { actionCreators as actions } from './reducer';
import store from './store';

const maxFramesPerSecond = 10;

const dropObstacle = WrappedComponent =>
  class DropObstacle extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      accepts: PropTypes.func,
    }

    static defaultProps = {
      accepts: () => false,
    }

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
      store.dispatch(
        actions.removeObstacle(this.props.id),
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

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        actions.upsertObstacle({
          id: this.props.id,
          accepts: this.props.accepts,
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

export default dropObstacle;
