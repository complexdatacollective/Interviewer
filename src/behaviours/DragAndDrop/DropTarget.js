/* eslint-disable */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { debounce, isMatch } from 'lodash';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { getDragContext } from './DragContext';

const maxFramesPerSecond = 10;

const dropTarget = WrappedComponent =>
  getDragContext()(
    class DropTarget extends Component {
      static defaultProps = {
        meta: () => ({}),
      }

      constructor(props) {
        super(props);

        this.onResize = debounce(this.onResize, 1000 / maxFramesPerSecond);
        window.addEventListener('resize', this.onResize);
      }

      componentDidMount() {
        if(!this.component) { return; }
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
        if(!this.node) { return; }

        const boundingClientRect = getAbsoluteBoundingRect(this.node);

        this.props.DragContext.dispatch({
          type: 'UPDATE_TARGET',
          accepts: this.props.accepts,
          meta: this.props.meta(),
          width: boundingClientRect.width,
          height: boundingClientRect.height,
          y: boundingClientRect.top,
          x: boundingClientRect.left,
        });
      }

      render() {
        const {
          accepts,
          meta,
          DragContext,
          ...props,
        } = this.props;

        return (
          <WrappedComponent
            ref={(component) => { this.component = component; }}
            {...props}
          />
        );
      }
    }
  );

export default dropTarget;
