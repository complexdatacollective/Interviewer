import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

import { actionCreators as droppableActions } from '../../ducks/modules/droppable';

const getPosition = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    y: Math.floor(boundingClientRect.top),
    x: Math.floor(boundingClientRect.left),
  }
}

const getSize = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    width: Math.floor(boundingClientRect.width),
    height: Math.floor(boundingClientRect.height),
  }
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

  element = () => {
    return ReactDOM.findDOMNode(this).firstChild;
  }

  onStart = (_, draggableData) => {
    const startPosition = getPosition(this.element());
    const size = getSize(this.element());
    const previewElement = this.element().cloneNode(true);
    document.getElementById('page-wrap').appendChild(previewElement);

    this.setState({
      preview: {
        startPosition,
        size,
        visible: true,
        element: previewElement,
      }
    }, () => {
      this.positionPreview(draggableData.x, draggableData.y);
    });

    console.log(size);
  }

  positionPreview = (x, y) => {
    if (!this.state.preview.element) { return; }
    x = x - Math.floor(this.state.preview.size.width / 2);
    y = y - Math.floor(this.state.preview.size.height / 2);
    this.state.preview.element.setAttribute('style', `position: absolute; left: 0px; top: 0px; transform: translate(${x}px, ${y}px);`);
  }

  onDrag = (event, draggableData) => {
    this.positionPreview(draggableData.x, draggableData.y);
  }

  onStop = (event, draggableData) => {
    document.getElementById('page-wrap').removeChild(this.state.preview.element);

    this.setState({
      preview: {
        visible: false,
      }
    });

    const dropped = {
      y: draggableData.y,
      x: draggableData.x,
    };

    this.props.updateZone({
      name: 'preview',
      width: 16,
      height: 16,
      y: dropped.y - 8,
      x: dropped.x - 8,
    })

    const hits = filter(this.props.zones, (zone) => {
      return dropped.x > zone.x && dropped.x < zone.x + zone.width && dropped.y > zone.y && dropped.y < zone.y + zone.height
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

function mapDispatchToProps(dispatch) {
  return {
    updateZone: bindActionCreators(droppableActions.updateZone, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Draggable);
