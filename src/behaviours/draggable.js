/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { filter } from 'lodash';
import DraggablePreview from '../utils/DraggablePreview';
import { actionCreators as draggableActions } from '../ducks/modules/draggable';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';

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

export default function draggable(WrappedComponent) {
  class Draggable extends Component {
    constructor(props) {
      super(props);

      this.state = initalState;
      this.preview = null;
    }

    componentDidMount() {
      this.el = findDOMNode(this.node);
      this.el.addEventListener('touchstart', this.handleMoveStart);
      this.el.addEventListener('touchmove', this.handleMove);
      this.el.addEventListener('touchend', this.handleMoveEnd);
      this.el.addEventListener('mousedown', this.handleMoveStart);
    }

    componentWillUnmount() {
      this.cleanupPreview();
      this.el.removeEventListener('touchstart', this.handleMoveStart);
      this.el.removeEventListener('touchmove', this.handleMove);
      this.el.removeEventListener('touchend', this.handleMoveEnd);
      this.el.removeEventListener('mousedown', this.handleMoveStart);
      window.removeEventListener('mousemove', this.handleMove);
      window.removeEventListener('mouseup', this.handleMoveEnd);
    }

    determineHits = ({ x, y }) =>
      filter(this.props.zones, (zone) => {
        if (zone.acceptsDraggableType !== this.props.draggableType) { return false; }
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height;
      });

    trackMouse = () => {
      window.addEventListener('mousemove', this.handleMove);
      window.addEventListener('mouseup', this.handleMoveEnd);
    }

    removeMouseTracking = () => {
      window.removeEventListener('mousemove', this.handleMove);
      window.removeEventListener('mouseup', this.handleMoveEnd);
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
      const draggablePreview = new DraggablePreview(this.node);

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
          this.props.dragStart(this.props.draggableType);
          this.createPreview();
        });
      }

      if (this.preview) {
        this.updatePreview(this.state);
      }
    }

    componentHandlers = (movement) => {
      if (this.state.dragStart) {
        const hits = this.determineHits(movement);
        this.props.updateActiveZones(hits.map(hit => hit.name));

        if (hits.length > 0) {
          this.props.onMove(hits, movement);
        }
      }
    }

    handleMoveStart = (e) => {
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

    handleMove = (e) => {
      if (this.state.moveStart) {
        const movement = this.movementFromEvent(e);
        const { x, y, t } = movement;

        // Determine move type
        this.detectMoveType(e, movement);

        // Detect drag start
        this.detectDragStart(movement);

        // If drag started, actually track stuff
        this.componentHandlers(movement);

        this.setState({ x, y, t });
      }
    }

    handleMoveEnd = (e) => {
      this.removeMouseTracking();
      this.cleanupPreview();
      this.props.dragStop();
      if (this.state.dragStart) {
        const movement = this.movementFromEvent(e);
        const hits = this.determineHits(movement);

        this.setState(initalState);

        if (hits.length > 0) {
          this.props.onDropped(hits, movement);
        }
      } else {
        this.setState(initalState);
      }
    }

    styles() {
      return this.state.dragStart ? { opacity: 0, width: 0, height: 0 } : { opacity: 1 };
    }

    render() {
      return (
        <div style={this.styles()}>
          <div ref={(node) => { this.node = node; }}>
            <WrappedComponent {...this.props} />
          </div>
        </div>
      );
    }
  }

  Draggable.propTypes = {
    zones: PropTypes.array.isRequired,
    draggableType: PropTypes.string.isRequired,
    dragStart: PropTypes.func.isRequired,
    dragStop: PropTypes.func.isRequired,
    onDropped: PropTypes.func,
    onMove: PropTypes.func,
    updateActiveZones: PropTypes.func.isRequired,
    // canDrag: PropTypes.bool,
  };

  Draggable.defaultProps = {
    canDrag: true,
    animate: false,
    onDropped: () => {},
    onMove: () => {},
  };

  function mapStateToProps(state) {
    return {
      zones: state.droppable.zones,
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      dragStart: bindActionCreators(draggableActions.dragStart, dispatch),
      dragStop: bindActionCreators(draggableActions.dragStop, dispatch),
      updateActiveZones: bindActionCreators(droppableActions.updateActiveZones, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps)(Draggable);
}
