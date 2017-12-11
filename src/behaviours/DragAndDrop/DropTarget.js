/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { mapProps } from 'recompose';
import { debounce, isMatch, uniqueId } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import dropId from './dropId';
import { actionCreators as actions } from './reducer';
import store from './store';

const maxFramesPerSecond = 12;

const dropTarget = WrappedComponent =>
  class DropTarget extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      onDrop: PropTypes.func,
      accepts: PropTypes.func,
      meta: PropTypes.func,
    }

    static defaultProps = {
      meta: () => ({}),
      accepts: () => false,
      onDrop: (...args) => { console.log(...args); },
    }

    constructor(props) {
      super(props);

      this.onResize = debounce(this.onResize, 1000 / maxFramesPerSecond);
      window.addEventListener('resize', this.onResize);
      this.interval = setInterval(this.updateTarget, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      if (!this.component) { return; }
      this.node = findDOMNode(this.component);
      this.updateTarget();
    }

    componentWillReceiveProps(props) {
      this.updateTarget();

      // TODO: Why is this necessary?
      if (props.id !== this.props.id) {
        this.renameTarget({
          from: this.props.id,
          to: props.id,
        });
      }
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
        actions.renameTarget(this.props.id),
      );
    }

    renameTarget = ({ from, to }) => {
      store.dispatch(
        actions.renameTarget({
          from,
          to,
        }),
      );
    }

    updateTarget = () => {
      if (!this.node) { return; }

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        actions.updateTarget({
          id: this.props.id,
          onDrop: this.props.onDrop,
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

export default compose(
  dropId('DropTarget'),
  dropTarget,
);
