import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { throttle } from 'lodash';

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

class Droppable extends Component {
  constructor(props) {
    super(props);

    this.updateZone = throttle(this.updateZone, 1000/60);  // 60fps max
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateZone);
  }

  componentDidMount() {
    this.updateZone();
    window.addEventListener('resize', this.updateZone);
  }

  componentDidUpdate() {
    this.updateZone();
  }

  updateZone = () => {
    const element = ReactDOM.findDOMNode(this);
    const boundingClientRect = getAbsoluteBoundingRect(element); //element.getBoundingClientRect();

    this.props.updateZone({
      name: this.props.name,
      width: boundingClientRect.width,
      height: boundingClientRect.height,
      top: boundingClientRect.top,
      left: boundingClientRect.left,
      bottom: boundingClientRect.bottom,
      right: boundingClientRect.right,
    });
  }

  render() {
    return (
      <div className='droppable'>
        { this.props.children }
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    updateZone: bindActionCreators(droppableActions.updateZone, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Droppable);
