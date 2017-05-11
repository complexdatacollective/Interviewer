import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { throttle } from 'lodash';

import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

import { actionCreators as droppableActions } from '../../ducks/modules/droppable';

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
      y: boundingClientRect.top,
      x: boundingClientRect.left,
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
