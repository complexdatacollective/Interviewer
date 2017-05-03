import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDraggable from 'react-draggable';
import ReactDOM from 'react-dom';
import { filter } from 'lodash';

import { actionCreators as droppableActions } from '../../ducks/modules/droppable';


/**
https://gist.github.com/rgrove/5463265

Returns a bounding rect for _el_ with absolute coordinates corrected for
scroll positions.

The native `getBoundingClientRect()` returns coordinates for an element's
visual position relative to the top left of the viewport, so if the element
is part of a scrollable region that has been scrolled, its coordinates will
be different than if the region hadn't been scrolled.

This method corrects for scroll offsets all the way up the node tree, so the
returned bounding rect will represent an absolute position on a virtual
canvas, regardless of scrolling.

@method getAbsoluteBoundingRect
@param {HTMLElement} el HTML element.
@return {Object} Absolute bounding rect for _el_.
**/

function getAbsoluteBoundingRect(el) {
    var doc  = document,
        win  = window,
        body = doc.body,

        // pageXOffset and pageYOffset work everywhere except IE <9.
        offsetX = win.pageXOffset !== undefined ? win.pageXOffset :
            (doc.documentElement || body.parentNode || body).scrollLeft,
        offsetY = win.pageYOffset !== undefined ? win.pageYOffset :
            (doc.documentElement || body.parentNode || body).scrollTop,

        rect = el.getBoundingClientRect();

    if (el !== body) {
        var parent = el.parentNode;

        // The element's rect will be affected by the scroll positions of
        // *all* of its scrollable parents, not just the window, so we have
        // to walk up the tree and collect every scroll offset. Good times.
        while (parent !== body) {
            offsetX += parent.scrollLeft;
            offsetY += parent.scrollTop;
            parent   = parent.parentNode;
        }
    }

    return {
        bottom: rect.bottom + offsetY,
        height: rect.height,
        left  : rect.left + offsetX,
        right : rect.right + offsetX,
        top   : rect.top + offsetY,
        width : rect.width
    };
}

class Draggable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      startPosition: {
        y: 0,
        x: 0,
      }
    };
  }

  getPosition = () => {
    const element = ReactDOM.findDOMNode(this).firstChild;
    const boundingClientRect = getAbsoluteBoundingRect(element);

    return {
      y: boundingClientRect.top + boundingClientRect.height * 0.5,
      x: boundingClientRect.left + boundingClientRect.width * 0.5,
    }
  }

  onStart = () => {
    const startPosition = this.getPosition();

    this.setState({
      startPosition
    });

    this.props.updateZone({
      name: 'preview',
      width: 16,
      height: 16,
      y: startPosition.y - 8,
      x: startPosition.x - 8,
    })

  }

  onStop = (event, draggableData) => {
    const { startPosition } = this.state;

    const dropped = {
      y: draggableData.y + startPosition.y,
      x: draggableData.x + startPosition.x,
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
    return (
      <ReactDraggable position={ { x: 0, y: 0 } } onStart={ this.onStart } onStop={ this.onStop } >
        { this.props.children }
      </ReactDraggable>
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
