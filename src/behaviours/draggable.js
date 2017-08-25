

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
  isMoving: false,
  preview: null,
};

function movementFromEventState(e, state) {
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

export default function draggable(WrappedComponent) {
  class Draggable extends Component {

    constructor(props) {
      super(props);

      this.state = initalState;
    }

    componentDidMount() {
      this.el = findDOMNode(this.node);
      this.el.addEventListener('touchstart', this.handleMoveStart);
      this.el.addEventListener('touchmove', this.handleMove);
      this.el.addEventListener('touchend', this.handleMoveEnd);
      this.el.addEventListener('mousedown', this.handleMoveStart);
      window.addEventListener('mousemove', this.handleMove);
      window.addEventListener('mouseup', this.handleMoveEnd);
    }

    componentWillUnmount() {
      this.el.removeEventListener('touchstart', this.handleMoveStart);
      this.el.removeEventListener('touchmove', this.handleMove);
      this.el.removeEventListener('touchend', this.handleMoveEnd);
      this.el.removeEventListener('mousedown', this.handleMoveStart);
      window.removeEventListener('mousemove', this.move);
      window.removeEventListener('mouseup', this.handleMoveEnd);
      this.cleanupPreview();
    }

    getHits = ({ x, y }) =>
      filter(this.props.zones, (zone) => {
        if (zone.acceptsDraggableType !== this.props.draggableType) { return false; }
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height;
      });

    cleanupPreview = () => {
      if (this.state.preview) {
        this.state.preview.cleanup();
      }
    }

    createPreview = () => {
      this.cleanupPreview();
      const draggablePreview = new DraggablePreview(this.node);

      this.setState({ preview: draggablePreview });
    }

    movement = (e, movement) => {
      const moveType = this.state.type || determineMoveType(movement);
      const totalMoveDistance = moveDistance(moveDelta(this.state.start, movement));

      if (moveType === 'DRAG') {
        e.preventDefault();
      }

      if (this.state.type === 'DRAG' && !this.state.preview && totalMoveDistance > 4) {
        this.setState({ dragStart: true }, () => {
          this.props.dragStart(this.props.draggableType);
          this.createPreview();
        });
      }

      if (this.state.preview) {
        this.state.preview.position(this.state);
      }

      if (this.state.dragStart) {
        const hits = this.getHits(movement);
        this.props.updateActiveZones(hits.map(hit => hit.name));

        if (hits.length > 0) {
          this.props.onMove(hits, movement);
        }
      }

      if (!this.state.type) {
        this.setState({ type: moveType });
      }
    };

    handleMoveStart = (e) => {
      const { x, y } = getCoords(e);
      this.setState({
        moveStart: true,
        dragStart: false,
        preview: null,
        type: isTouch(event) ? null : 'DRAG',  // if mouse, assume drag
        start: { x, y },
        t: new Date().getTime(),
        x,
        y,
      });
    }

    handleMove = (e) => {
      if (this.state.moveStart) {
        const movement = movementFromEventState(e, this.state);
        const { x, y, t } = movement;
        this.movement(e, movement);
        this.setState({ x, y, t });
      }
    }

    handleMoveEnd = (e) => {
      if (this.state.dragStart) {
        const hits = this.getHits(movementFromEventState(e, this.state));

        if (hits.length > 0) {
          this.props.onDropped(hits);
        }

        this.props.dragStop();
      }
      this.cleanupPreview();
      this.setState({
        moveStart: false,
        preview: null,
      });
    }

    render() {
      return (
        <div ref={(node) => { this.node = node; }}>
          <WrappedComponent {...this.props} />
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
