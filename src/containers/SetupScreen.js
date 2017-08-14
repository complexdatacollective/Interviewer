import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, TextInput } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  onClickLoadProtocol = (fields) => {
    if (fields) {
      this.props.loadProtocol(fields.protocol_url);
    }
  }

  onClickLoadDemoProtocol = () => {
    this.props.loadDemoProtocol();
  }

  render() {
    if (this.props.protocolLoaded) { return (<Redirect to={{ pathname: '/protocol' }} />); }

    return (
      <div className="setup">
        <h1>Welcome to Network Canvas</h1>
        <p>
          Thank you for taking the time to explore this exciting new chapter in
          the development of our software.
        </p>
        <TextInput
          className="input--wurm"
          name="protocolLocation"
          label="Protocol Location"
          value="Josh is sweet"
        />
        <hr />
        <Button onClick={this.onClickLoadDemoProtocol} content="Load demo protocol" />
      </div>
    );
  }
}

Setup.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  loadDemoProtocol: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolLoaded: state.protocol.loaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    loadDemoProtocol: bindActionCreators(protocolActions.loadDemoProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
