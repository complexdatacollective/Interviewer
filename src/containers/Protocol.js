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
      this.props.loadProtocol(this.props.stageId);
    }
  }

  render() {
    return (
      <div className='protocol'>
        <Stage id={this.props.stageId} />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    protocol: state.protocol,
    stageId: ownProps.params.id
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Protocol);
