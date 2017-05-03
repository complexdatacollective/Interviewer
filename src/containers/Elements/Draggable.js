import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter, throttle } from 'lodash';

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

import { actionCreators as droppableActions } from '../../ducks/modules/droppable';

const getSize = (element) => {
  const boundingClientRect = getAbsoluteBoundingRect(element);

  return {
    width: Math.floor(boundingClientRect.width),
    height: Math.floor(boundingClientRect.height),
  }
}

class DraggablePreview {
  constructor(node) {
    this.position = throttle(this.position, 1000/60);

    this.node = document.createElement('div');
    this.node.setAttribute('class', 'draggable-preview');
    this.node.appendChild(node.cloneNode(true));

    this.parent().appendChild(this.node);
  }

  parent() {
    return document.getElementById('page-wrap');
  }

  size() {
    if (!this.node) { return { width: 0, height: 0 }; }
    if (!this._size) { this._size = getSize(this.node); }
    return this._size;
  }

  center() {
    if (!this._center) {
      this._center = {
        x: Math.floor(this.size().width / 2),
        y: Math.floor(this.size().height / 2),
      }
    }
    return this._center;
  }

  position(x, y) {
    x = x - this.center().x;
    y = y - this.center().y;
    this.node.setAttribute('style', `position: absolute; left: 0px; top: 0px; transform: translate(${x}px, ${y}px);`);
  }

  cleanup() {
    this.parent().removeChild(this.node);
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

  componentWillUnmount() {
    if (this.state.preview.preview) { this.state.preview.preview.cleanup(); }
  }

  onStart = (_, draggableData) => {
    const draggablePreview = new DraggablePreview(ReactDOM.findDOMNode(this).firstChild);

    this.props.updateZone({
      name: 'preview',
      width: 0,
      height: 0,
      y: 0,
      x: 0,
    })

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

    this.props.updateZone({
      name: 'preview',
      width: 16,
      height: 16,
      y: draggableData.y - 8,
      x: draggableData.x - 8,
    })

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
