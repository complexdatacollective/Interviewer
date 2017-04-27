import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';
import DraggablePreview from '../../utils/DraggablePreview';

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

  onStart = (_, draggableData) => {
    const draggablePreview = new DraggablePreview(ReactDOM.findDOMNode(this).firstChild);

    this.setState({
      preview: {
        visible: true,
        preview: draggablePreview,
      }
    }, () => {
      this.state.preview.preview.position(draggableData.x, draggableData.y);
    });
  }

  onDrag = (event, draggableData) => {
    if (!this.state.preview.preview) { return; }
    this.state.preview.preview.position(draggableData.x, draggableData.y);
  }

  onStop = (event, draggableData) => {
    if (this.state.preview.preview) { this.state.preview.preview.cleanup(); }

    this.setState({
      preview: {
        visible: false,
      }
    });

    const hits = filter(this.props.zones, (zone) => {
      return draggableData.x > zone.x && draggableData.x < zone.x + zone.width && draggableData.y > zone.y && draggableData.y < zone.y + zone.height
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
