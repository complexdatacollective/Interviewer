import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import { throttle } from 'lodash';

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
    const boundingClientRect = element.getBoundingClientRect();

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

export default connect(mapStateToProps, mapDispatchToProps)(Droppable);
