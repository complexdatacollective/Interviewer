import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import Stage from './Stage';

/**
  * Load protocol data, and render a stage
  */
class Protocol extends Component {

  componentWillMount() {
    if (!this.props.protocol.protocolLoaded) {
      this.props.loadProtocol()
    }
  }

  render() {
    return (
      <div className='protocol'>
        <Stage />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    protocol: state.protocol
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Protocol);
