import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import { filter } from 'lodash';
import uidGenerator from '../utils/uidGenerator';
import DraggablePreview from '../utils/DraggablePreview';
import { actionCreators as draggableActions } from '../ducks/modules/draggable';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';

function getCoords(event) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
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

function moveDistance(start, draggableData) {
  return Math.sqrt((draggableData.x - start.x) ** 2, (draggableData.y - start.y) ** 2);
}

const key = uidGenerator();

export default function draggable(WrappedComponent) {
  class Draggable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        preview: null,
        key: key.next().value,
      };
    }

    componentWillUnmount() {
      this.destroyPreview();
    }

    onStart = (event, draggableData) => {
      this.setState({
        start: {
          x: draggableData.x,
          y: draggableData.y,
        },
      });
    }

    onDrag = (event, draggableData) => {
      if (!this.state.preview) {  // TODO: better way to keep track of drag start?
        if (moveDistance(this.state.start, draggableData) > 4) {
          this.startDrag(event, draggableData);
        }
        return;
      }

      const hits = this.getHits(getCoords(event, draggableData));
      this.props.updateActiveZones(hits.map(hit => hit.name));

      if (hits.length > 0) {
        this.props.onDrag(hits, getCoords(event, draggableData));
      }

      this.updateDrag(event, draggableData);
    }

    onStop = (event, draggableData) => {
      this.endDrag();

      this.setState({
        preview: null,
        start: {},
      });

      const hits = this.getHits(getCoords(event, draggableData));

      if (hits.length > 0) {
        this.props.onDropped(hits, getCoords(event, draggableData));
      }
    }

    getHits = ({ x, y }) =>
      filter(this.props.zones, (zone) => {
        if (zone.acceptsDraggableType !== this.props.draggableType) { return false; }
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height;
      });

    destroyPreview = () => {
      if (this.state.preview) { this.state.preview.cleanup(); }
    }

    createPreview = (event, draggableData) => {
      const draggablePreview = new DraggablePreview(this.node, this.props.animate);
      const coords = getCoords(event, draggableData);

      this.setState({
        preview: draggablePreview,
      }, () => {
        this.state.preview.position(coords);
      });
    }

    startDrag = (event, draggableData) => {
      this.createPreview(event, draggableData);
      this.props.dragStart(this.props.draggableType);
    }

    updateDrag = (event, draggableData) => {
      this.state.preview.position(getCoords(event, draggableData));
    }

    endDrag = () => {
      this.destroyPreview();
      this.props.dragStop();
    }

    isActive() {
      return this.state.preview !== null;
    }

    render() {
      if (!this.props.canDrag) {
        return (
          <div ref={(node) => { this.node = node; }}>
            <WrappedComponent {...this.props} />
          </div>
        );
      }

      const opacity = this.isActive() ? { opacity: 0, width: 0, height: 0 } : { opacity: 1, transition: 'all 300ms ease' };

      return (
        <DraggableCore onStart={this.onStart} onStop={this.onStop} onDrag={this.onDrag}>
          <div style={opacity} ref={(node) => { this.node = node; }}>
            <WrappedComponent {...this.props} />
          </div>
        </DraggableCore>
      );
    }
  }

  Draggable.propTypes = {
    zones: PropTypes.array.isRequired,
    draggableType: PropTypes.string.isRequired,
    dragStart: PropTypes.func.isRequired,
    dragStop: PropTypes.func.isRequired,
    onDropped: PropTypes.func,
    onDrag: PropTypes.func,
    updateActiveZones: PropTypes.func.isRequired,
    canDrag: PropTypes.bool,
    animate: PropTypes.bool,
  };

  Draggable.defaultProps = {
    canDrag: true,
    animate: true,
    onDropped: () => {},
    onDrag: () => {},
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
