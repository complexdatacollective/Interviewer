/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DraggableCore } from 'react-draggable';
import { CSSTransitionGroup } from 'react-transition-group';
import { filter } from 'lodash';
import DraggablePreview from '../utils/DraggablePreview';
import { actionCreators as draggableActions } from '../ducks/modules/draggable';
import { actionCreators as droppableActions } from '../ducks/modules/droppable';
import styles from '../ui/styles';

function getCoords(event) {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.changedTouches.item(0);
    return {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function moveDistance(start, draggableData) {
  return Math.sqrt((draggableData.x - start.x) ** 2, (draggableData.y - start.y) ** 2);
}

function* uidGenerator() {
  let i = 1;
  for (;;) {
    yield i;
    i += 1;
  }
}

const key = uidGenerator();

export default function draggable(WrappedComponent) {
  class Draggable extends Component {

    constructor(props) {
      super(props);

      this.state = {
        preview: null,
        key: key.next().value,
      };
    }

    componentWillUnmount() {
      this.destroyPreview();
    }

    onStart = (event, draggableData) => {
      this.setState({
        start: {
          x: draggableData.x,
          y: draggableData.y,
        },
      });
    }

    onDrag = (event, draggableData) => {
      if (!this.state.preview) {  // TODO: better way to keep track of drag start?
        if (moveDistance(this.state.start, draggableData) > 4) {
          this.startDrag(event, draggableData);
        }
        return;
      }

      const hits = this.getHits(getCoords(event, draggableData));
      this.props.updateActiveZones(hits.map((hit) => hit.name));

      this.updateDrag(event, draggableData);
    }

    onStop = (event, draggableData) => {
      this.endDrag();

      this.setState({
        preview: null,
        start: {},
      });

      const hits = this.getHits(getCoords(event, draggableData));

      if (hits.length > 0) {
        this.props.onDropped(hits);
      }
    }

    getHits = ({ x, y }) =>
      filter(this.props.zones, (zone) => {
        if (zone.acceptsDraggableType !== this.props.draggableType) { return false; }
        return x > zone.x && x < zone.x + zone.width && y > zone.y && y < zone.y + zone.height;
      });

    destroyPreview = () => {
      if (this.state.preview) { this.state.preview.cleanup(); }
    }

    createPreview = (event, draggableData) => {
      const draggablePreview = new DraggablePreview(this.node);
      const coords = getCoords(event, draggableData);

      this.setState({
        preview: draggablePreview,
      }, () => {
        this.state.preview.position(coords);
      });
    }

    startDrag = (event, draggableData) => {
      this.createPreview(event, draggableData);
      this.props.dragStart(this.props.draggableType);
    }

    updateDrag = (event, draggableData) => {
      this.state.preview.position(getCoords(event, draggableData));
    }

    endDrag = () => {
      this.destroyPreview();
      this.props.dragStop();
    }

    isActive() {
      return this.state.preview !== null;
    }

    render() {
      return (
        <DraggableCore onStart={this.onStart} onStop={this.onStop} onDrag={this.onDrag}>
          <CSSTransitionGroup
            transitionName="draggable--transition"
            transitionAppear
            transitionAppearTimeout={styles.animation.duration.fast}
            transitionEnterTimeout={styles.animation.duration.fast}
            transitionLeaveTimeout={styles.animation.duration.fast}
          >
            { !this.isActive() &&
              <div ref={(node) => { this.node = node; }} key={this.state.key}>
                <WrappedComponent {...this.props} />
              </div>
            }
          </CSSTransitionGroup>
        </DraggableCore>
      );
    }
  }

  Draggable.propTypes = {
    zones: PropTypes.array.isRequired,
    draggableType: PropTypes.string.isRequired,
    dragStart: PropTypes.func.isRequired,
    dragStop: PropTypes.func.isRequired,
    onDropped: PropTypes.func.isRequired,
  };

  Draggable.defaultProps = {
  };

  function mapStateToProps(state) {
    return {
      zones: state.droppable.zones,
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      dragStart: bindActionCreators(draggableActions.dragStart, dispatch),
      dragStop: bindActionCreators(draggableActions.dragStop, dispatch),
      updateActiveZones: bindActionCreators(droppableActions.updateActiveZones, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps)(Draggable);
}
