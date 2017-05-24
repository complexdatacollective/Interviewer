import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import Stage from './Stage';

/**
  * Load protocol data, and render a stage
  * @extends Component
  */
class Protocol extends Component {

  /**
    * loads protocol when mounting
    */
  componentWillMount() {
    if (!this.props.protocolLoaded) {
      this.props.loadProtocol();
    }
  }

  render() {
    return (
      <div className="protocol">
        <Stage />
      </div>
    );
  }
}

Protocol.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolLoaded: state.protocol.protocolLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Protocol);
