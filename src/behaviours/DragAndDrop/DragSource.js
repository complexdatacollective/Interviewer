/* eslint-disable react/no-find-dom-node, react/sort-comp */

import React, { PureComponent } from 'react';
import { compose } from 'redux';
import { findDOMNode } from 'react-dom'; // eslint-disable-line camelcase
import PropTypes from 'prop-types';
import dropId from './dropId';
import DragPreview from './DragPreview';
import dragManager from './dragManager';
import { actionCreators as actions } from './reducer';
import store from './store';

const dragSource = WrappedComponent =>
  class DragSource extends PureComponent {
    static propTypes = {
      allowDrag: PropTypes.bool,
      meta: PropTypes.func,
    };

    static defaultProps = {
      allowDrag: true,
      meta: () => ({}),
    };

    constructor(props) {
      super(props);

      this.state = {};

      this.dragManager = null;
      this.preview = null;
    }

    componentDidMount() {
      if (!this.props.allowDrag) { return; }

      this.dragManager = new dragManager({
        el: this.node,
        onDragStart: this.onDragStart,
        onDragMove: this.onDragMove,
        onDragEnd: this.onDragEnd,
      });
    }

    componentWillUnmount() {
      this.cleanupPreview();
      this.cleanupDragManager();
    }

    cleanupDragManager = () => {
      if (this.dragManager) {
        this.dragManager.unmount();
        this.dragManager = null;
      }
    };

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
      if (this.preview) {
        this.preview.position({ x, y });
      }
    }

    onDragStart = (movement) => {
      this.createPreview();
      store.dispatch(
        actions.dragStart({
          ...movement,
          meta: this.props.meta(),
        }),
      );
      this.setState({ isDragging: true }); // TODO: Should this be handled in a manager?
    }

    onDragMove = ({ x,  y, ...rest }) => {
      this.updatePreview({ x,  y });
      store.dispatch(
        actions.dragMove({
          x, y, ...rest,
        }),
      );
    }

    onDragEnd = (movement) => {
      this.cleanupPreview();
      this.setState({ isDragging: false });
      store.dispatch(
        actions.dragEnd(movement),
      );
    }

    styles = () =>  (this.state.isDragging ? { visibility: 'hidden' } : {});

    render() {
      const {
        allowDrag,
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

export default compose(
  dropId('DragSource'),
  dragSource,
);
