/* eslint-disable */
/* eslint-disable react/no-find-dom-node, react/sort-comp */

import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom'; // eslint-disable-line camelcase
import { getDragContext } from './DragContext';
import DragPreview from './DragPreview';
import dragManager from './dragManager';

const dragSource = WrappedComponent =>
  class DragSource extends PureComponent {
    static propTypes = {
    };

    static defaultProps = {
      canDrag: true,
    };

    constructor(props) {
      super(props);

      this.dragManager = null;
      this.preview = null;
    }

    componentDidMount() {
      if (!this.props.canDrag) { return; }
      // findDOMNode(this.node);
      this.dragManager = new dragManager({
        el: this.node,
        onDragStart: this.onDragStart,
        onDragMove: this.onDragMove,
        onDragEnd: this.onDragEnd,
      });
    }

    componentWillUnmount() {
      this.cleanupPreview();
      this.dragManager.unmount();
    }

    cleanupPreview = () => {
      if (this.preview) {
        this.preview.cleanup();
        this.preview = null;
      }
    }

    createPreview = () => {
      const draggablePreview = new DragPreview(this.node);

      this.preview = draggablePreview;
    }

    updatePreview = ({ x, y }) => {
      this.preview.position({ x, y });
    }

    onDragStart = (...args) => {
      this.createPreview();
    }

    onDragMove = ({ x,  y, ...rest }) => {
      this.updatePreview({ x,  y });
    }

    onDragEnd = (...args) => {
      this.cleanupPreview();
    }

    styles() {
      if (!this.dragManager) { return { visibility: 'initial' }; }
      return this.dragManager.isDragging() ? { visibility: 'hidden' } : { visibility: 'initial' };
    }

    render() {
      const {
        canDrag,
        ...rest
      } = this.props;

      return (
        <div style={this.styles()}>
          <div ref={(node) => { this.node = node; }}>
            <WrappedComponent {...rest} ref={(component) => { this.component = component; }} />
          </div>
        </div>
      );
    }
  };

export default dragSource;
