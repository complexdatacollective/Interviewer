/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { throttle, isEqual } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';

const maxFramesPerSecond = 6;
const initialZoneState = {
  name: null,
  acceptsDraggableType: null,
  width: null,
  height: null,
  y: null,
  x: null,
};

export default function droppable(WrappedComponent) {
  class Droppable extends Component {
    constructor(props) {
      super(props);

      this.lastZoneState = initialZoneState;

      this.updateZone = throttle(this.updateZone, 1000 / maxFramesPerSecond);
    }

    componentDidMount() {
      this.updateZone();
    }

    componentWillUnmount() {
      window.cancelAnimationFrame(this.animationRequestId);
    }

    updateZone = () => {
      if (!this.props.droppableName) { return; }

      const boundingClientRect = getAbsoluteBoundingRect(this.node);

      const nextZoneState = {
        name: this.props.droppableName,
        acceptsDraggableType: this.props.acceptsDraggableType,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      };

      if (!isEqual(nextZoneState, this.lastZoneState)) {
        this.lastZoneState = nextZoneState;
        this.props.updateZone(nextZoneState);
      }

      this.animationRequestId = window.requestAnimationFrame(this.updateZone);
    }

    render() {
      return (
        <WrappedComponent
          ref={() => { this.node = findDOMNode(this); }}
          hover={this.props.hover}
          {...this.props}
        />
      );
    }
  }

  Droppable.propTypes = {
    updateZone: PropTypes.func.isRequired,
    droppableName: PropTypes.string,
    acceptsDraggableType: PropTypes.string,
    hover: PropTypes.bool,
  };

  Droppable.defaultProps = {
    acceptsDraggableType: null,
    droppableName: null,
    hover: false,
  };

  function mapStateToProps(state, ownProps) {
    return {
      hover: state.droppable.activeZones.includes(ownProps.droppableName),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      updateZone: bindActionCreators(droppableActions.updateZone, dispatch),
    };
  }


  return connect(mapStateToProps, mapDispatchToProps)(Droppable);
}
