import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import Stage from './Stage';

/**
  * Load protocol data, and render a stage
  */
class Protocol extends Component {

  componentWillMount() {
    if (!this.props.protocolLoaded) {
      this.props.loadProtocol(this.props.stageId);
    }
  }

  render() {
    return (
      <div className="protocol">
        <Stage id={this.props.stageId} />
      </div>
    );
  }
}

Protocol.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  stageId: PropTypes.string,
};

Protocol.defaultProps = {
  stageId: '',
};

function mapStateToProps(state, ownProps) {
  return {
    protocolLoaded: state.protocol.protocolLoaded,
    stageId: ownProps.params.id,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Protocol);
