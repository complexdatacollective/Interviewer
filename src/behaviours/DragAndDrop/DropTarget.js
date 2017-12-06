/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { mapProps } from 'recompose';
import { debounce, isMatch, uniqueId } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import dropId from './dropId';
import { actionCreators as dragActions, store } from './dragState';

const maxFramesPerSecond = 10;

const dropTarget = WrappedComponent =>
  class DropTarget extends Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
      onDrop: PropTypes.func,
      accepts: PropTypes.array,
      meta: PropTypes.func,
    }

    static defaultProps = {
      meta: () => ({}),
      accepts: [],
      onDrop: (...args) => { console.log(...args); },
    }

    constructor(props) {
      super(props);

      this.onResize = debounce(this.onResize, 1000 / maxFramesPerSecond);
      window.addEventListener('resize', this.onResize);
    }

    componentDidMount() {
      if (!this.component) { return; }
      this.node = findDOMNode(this.component);
      this.updateTarget();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
      this.onResize.cancel();
    }

    onResize = () => {
      this.updateTarget();
      setTimeout(this.updateTarget, 1000);
    }

    updateTarget = () => {
      if (!this.node) { return; }

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      store.dispatch(
        dragActions.updateTarget({
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
