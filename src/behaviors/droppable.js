import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { throttle } from 'lodash';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';

export default function droppable(WrappedComponent) {

  class Droppable extends Component {
    constructor(props) {
      super(props);

      this.updateZone = throttle(this.updateZone, 1000/24);  // 24fps max
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
      if (!this.props.droppableName) { return; }

      const element = ReactDOM.findDOMNode(this);
      const boundingClientRect = getAbsoluteBoundingRect(element); //element.getBoundingClientRect();

      this.props.updateZone({
        name: this.props.droppableName,
        acceptsDraggableType: this.props.acceptsDraggableType,
        width: boundingClientRect.width,
        height: boundingClientRect.height,
        y: boundingClientRect.top,
        x: boundingClientRect.left,
        x: boundingClientRect.left,
      });
    }

    render() {
      return <WrappedComponent { ...this.props } />;
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

  Droppable.defaultProps = {
    acceptsDraggableType: null,
  };

  return connect(mapStateToProps, mapDispatchToProps)(Droppable);
}
