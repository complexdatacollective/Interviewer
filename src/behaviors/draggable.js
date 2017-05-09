import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';
import DraggablePreview from '../utils/DraggablePreview';

function getCoords(event) {
  return {
    x: event.clientX,
    y: event.clientY,
  };
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
      if (this.state.preview) { this.state.preview.cleanup(); }
    }

    onStart = (event, draggableData) => {
      this.setState({
        start: {
          x: draggableData.x,
          y: draggableData.y,
        }
      });
    }

    onDrag = (event, draggableData) => {
      if (!this.state.preview) {
        if (moveDistance(this.state.start, draggableData) > 5) {
          const draggablePreview = new DraggablePreview(ReactDOM.findDOMNode(this).firstChild);
          const coords = getCoords(event, draggableData);
          this.setState({
            preview: draggablePreview,
          }, () => {
            this.state.preview.position(coords);
          });
        }
      }

      this.state.preview.position(getCoords(event, draggableData));
    }

    onStop = (event, draggableData) => {
      if (this.state.preview) { this.state.preview.cleanup(); }

      this.setState({
        preview: null,
        start: {},
      });

      const {
        x,
        y,
      } = getCoords(event, draggableData);

      const hits = filter(this.props.zones, (zone) => {
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height
      });

      if (hits.length > 0) {
        this.props.onDropped(hits);
      }

    }

    render() {
      const opacity = this.state.preview !== null ? { opacity: 0 } : { opacity: 1 };

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

  return connect(mapStateToProps)(Draggable);
}
