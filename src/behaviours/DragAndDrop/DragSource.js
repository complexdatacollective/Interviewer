/* eslint-disable */
/* eslint-disable react/no-find-dom-node, react/sort-comp */

import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom'; // eslint-disable-line camelcase
import { throttle, filter, isMatch } from 'lodash';
import { getDragContext } from './DragContext';
import DragPreview from './DragPreview';

function isTouch(event) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    return true;
  }
  return false;
}

function getCoords(event) {
  if (isTouch(event)) {
    const touch = event.changedTouches.item(0);
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function moveDelta(start, end) {
  return {
    dy: end.y - start.y,
    dx: end.x - start.x,
  };
}

function moveDistance({ dx, dy }) {
  return ((dx ** 2) + (dy ** 2)) ** 0.5;
}

function moveAngle({ dx, dy }) {
  return Math.atan(dy / dx);
}

function axisProximityFromAngle(angle) {
  return Math.abs(Math.cos(2 * angle)) ** 2;
}

function determineMoveType(movement) {
  if (movement.velocity * movement.axisProximity > 0.1) {
    return 'SWIPE';
  }
  return 'DRAG';
}

const initalState = {
  moveStart: false,
  dragStart: false,
  type: null,
};

const dragSource = WrappedComponent =>
  class DragSource extends Component {
    static propTypes = {
    };

    static defaultProps = {
    };

    constructor(props) {
      super(props);

      this.state = initalState;
      this.preview = null;
    }

    componentDidMount() {
      if (!this.props.canDrag) { return; }
      this.el = findDOMNode(this.node);
      this.el.addEventListener('touchstart', this.onMoveStart, { passive: true });
      this.el.addEventListener('touchmove', this.onMove);
      this.el.addEventListener('touchend', this.onMoveEnd, { passive: true });
      this.el.addEventListener('mousedown', this.onMoveStart, { passive: true });
    }

    shouldComponentUpdate(newProps, newState) {
      const propsChanged = !isMatch(this.props, newProps);
      const dragStateChanged = newState.dragStart !== this.state.dragStart;
      return dragStateChanged || propsChanged;
    }

    componentWillUnmount() {
      this.cleanupPreview();
      window.removeEventListener('mousemove', this.onMove);
      window.removeEventListener('mouseup', this.onMoveEnd);
      if (this.el) {
        this.el.removeEventListener('touchstart', this.onMoveStart);
        this.el.removeEventListener('touchmove', this.onMove);
        this.el.removeEventListener('touchend', this.onMoveEnd);
        this.el.removeEventListener('mousedown', this.onMoveStart);
      }
    }

    trackMouse = () => {
      if (!this.props.canDrag) { return; }
      window.addEventListener('mousemove', this.onMove);
      window.addEventListener('mouseup', this.onMoveEnd, { passive: true });
    }

    removeMouseTracking = () => {
      window.removeEventListener('mousemove', this.onMove);
      window.removeEventListener('mouseup', this.onMoveEnd);
    }

    movementFromEvent = (e) => {
      const state = this.state;
      const { x, y } = getCoords(e);
      const { dy, dx } = moveDelta(state, { x, y });
      const t = new Date().getTime();
      const dt = t - state.t;
      const distance = moveDistance({ dy, dx });
      const angle = moveAngle({ dy, dx });
      const axisProximity = axisProximityFromAngle(angle);
      return {
        x,
        y,
        dy,
        dx,
        dt,
        velocity: distance / dt,
        distance,
        axisProximity,
        angle,
      };
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

    detectMoveType = (e, movement) => {
      const moveType = this.state.type || determineMoveType(movement);

      if (moveType === 'DRAG') {
        e.preventDefault();
      }

      if (!this.state.type) {
        this.setState({ type: moveType });
      }
    }

    detectDragStart = (movement) => {
      if (this.state.type === 'DRAG' && !this.preview && movement.distance > 4) {
        this.setState({ dragStart: true }, () => {
          // TODO: Drag start event
          this.createPreview();
        });
      }

      if (this.preview) {
        this.updatePreview(this.state);
      }
    }

    onMoveStart = (e) => {
      this.trackMouse();
      const { x, y } = getCoords(e);
      this.setState({
        moveStart: true,
        dragStart: false,
        type: isTouch(e) ? null : 'DRAG', // if mouse, assume drag
        start: { x, y },
        t: new Date().getTime(),
        x,
        y,
      });
    }

    onMove = (e) => {
      if (this.state.moveStart) {
        const movement = this.movementFromEvent(e);
        const { x, y, t } = movement;

        // Determine move type
        this.detectMoveType(e, movement);

        // Detect drag start
        this.detectDragStart(movement);

        if (this.state.dragStart) {
        //   this.setState({ x, y, t });
        // TODO: Drag move event
        }

        this.setState({ x, y, t });
      }
    }

    onMoveEnd = (e) => {
      this.removeMouseTracking();
      this.cleanupPreview();

      if (this.state.dragStart) {
        const movement = this.movementFromEvent(e);

        // TODO: Drag stop
      } else {
        this.setState(initalState);
      }

      // this.props.dragStop();?
    }

    styles() {
      return this.state.dragStart ? { visibility: 'hidden' } : { visibility: 'initial' };
    }

    render() {
      const {
        zones,
        draggableType,
        dragStart,
        dragStop,
        onDropped,
        onMove,
        updateActiveZones,
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
