import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';
import DraggablePreview from '../utils/DraggablePreview';
import { actionCreators as draggableActions } from '../ducks/modules/draggable';

function getCoords(event) {
  if (event instanceof TouchEvent) {
    const touch = event.changedTouches.item(0);
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  } else {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }
}

function moveDistance(start, draggableData) {
  return Math.sqrt(Math.pow(draggableData.x - start.x, 2), Math.pow(draggableData.y - start.y, 2));
}

export default function draggable(WrappedComponent) {
  class Draggable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        preview: null,
      };
    }

    componentWillUnmount() {
      this.destroyPreview();
    }

    createPreview = (event, draggableData) => {
      const draggablePreview = new DraggablePreview(ReactDOM.findDOMNode(this).firstChild);
      const coords = getCoords(event, draggableData);
      this.setState({
        preview: draggablePreview,
      }, () => {
        this.state.preview.position(coords);
      });
    }

    destroyPreview = () => {
      if (this.state.preview) { this.state.preview.cleanup(); }
    }

    getHits = ({ x, y }) => {
      return filter(this.props.zones, (zone) => {
        if (zone.acceptsDraggableType !== this.props.draggableType) { return false; }
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height;
      });
    }

    onStart = (event, draggableData) => {
      this.props.dragStart();
      this.setState({
        start: {
          x: draggableData.x,
          y: draggableData.y,
        }
      });
    }

    onDrag = (event, draggableData) => {
      if (!this.state.preview) {
        if (moveDistance(this.state.start, draggableData) > 4) {
          this.createPreview(event, draggableData)
        }
        return;
      }

      this.state.preview.position(getCoords(event, draggableData));
    }

    onStop = (event, draggableData) => {
      this.destroyPreview();

      this.props.dragStop();

      this.setState({
        preview: null,
        start: {},
      });

      const hits = this.getHits(getCoords(event, draggableData));

      if (hits.length > 0) {
        this.props.onDropped(hits);
      }
    }

    render() {
      const opacity = this.state.preview !== null ? { opacity: 0 } : { opacity: 1, transition: 'opacity 300ms ease' };

      return (
        <DraggableCore onStart={ this.onStart } onStop={ this.onStop } onDrag={ this.onDrag }>
          <div style={ opacity }>
            <WrappedComponent { ...this.props } />
          </div>
        </DraggableCore>
      );
    }
  }

  function mapStateToProps(state) {
    return {
      zones: state.droppable.zones,
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
      dragStart: bindActionCreators(draggableActions.dragStart, dispatch),
      dragStop: bindActionCreators(draggableActions.dragStop, dispatch)
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(Draggable);
}
