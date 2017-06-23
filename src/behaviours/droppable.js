/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';

export default function droppable(WrappedComponent) {
  class Droppable extends Component {
    constructor(props) {
      super(props);

      this.updateZone = throttle(this.updateZone, 1000 / 24);  // 24fps max
    }

    componentDidMount() {
      this.updateZone();
      window.addEventListener('resize', this.updateZone);
    }

    componentDidUpdate() {
      this.updateZone();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateZone);
    }

    updateZone = () => {
      if (!this.props.droppableName) { return; }

      const node = ReactDOM.findDOMNode(this);

      const boundingClientRect = getAbsoluteBoundingRect(node);

      this.props.updateZone({
        name: this.props.droppableName,
        acceptsDraggableType: this.props.acceptsDraggableType,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
      });
    }

    render() {
      return (
        <WrappedComponent
          ref={(node) => { this.node = node; }}
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
      hover: (ownProps.name in state.droppable.activeZones),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      updateZone: bindActionCreators(droppableActions.updateZone, dispatch),
    };
  }


  return connect(mapStateToProps, mapDispatchToProps)(Droppable);
}
