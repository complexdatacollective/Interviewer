import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';
import DraggablePreview from '../../utils/DraggablePreview';

function getCoords(event, draggableData) {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

class Draggable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      preview: {
        visible: false,
      },
    };
  }

  componentWillUnmount() {
    if (this.state.preview.preview) { this.state.preview.preview.cleanup(); }
  }

  onStart = (event, draggableData) => {
    const draggablePreview = new DraggablePreview(ReactDOM.findDOMNode(this).firstChild);

    const coords = getCoords(event, draggableData);

    this.setState({
      preview: {
        visible: true,
        preview: draggablePreview,
      }
    }, () => {
      this.state.preview.preview.position(coords);
    });
  }

  onDrag = (event, draggableData) => {
    if (!this.state.preview.preview) { return; }
    this.state.preview.preview.position(getCoords(event, draggableData));
  }

  onStop = (event, draggableData) => {
    if (this.state.preview.preview) { this.state.preview.preview.cleanup(); }

    this.setState({
      preview: {
        visible: false,
      }
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
    const opacity = this.state.preview.visible ? { opacity: 0 } : { opacity: 1 };

    return (
      <DraggableCore position={ { x: 0, y: 0 } } onStart={ this.onStart } onStop={ this.onStop } onDrag={ this.onDrag }>
        <div style={ opacity }>
          { this.props.children }
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

export default connect(mapStateToProps)(Draggable);
