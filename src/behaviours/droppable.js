/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { throttle, isMatch } from 'lodash';
import { createSelector } from 'reselect';
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
      window.addEventListener('resize', this.updateZone);
    }

    componentDidMount() {
      this.updateZone();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateZone);
      this.updateZone.cancel();
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

      if (!isMatch(nextZoneState, this.lastZoneState)) {
        this.lastZoneState = nextZoneState;
        this.props.updateZone(nextZoneState);
      }
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

  const activeZones = state => state.droppable.activeZones;
  const droppableName = (_, props) => props.droppableName;

  function getMapStateToProps() {
    const isZoneActive = createSelector(
      [activeZones, droppableName],
      (zones, name) => zones.includes(name),
    );

    return function mapStateToProps(state, props) {
      return {
        hover: isZoneActive(state, props),
      };
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      updateZone: bindActionCreators(droppableActions.updateZone, dispatch),
    };
  }


  return connect(getMapStateToProps, mapDispatchToProps)(Droppable);
}
