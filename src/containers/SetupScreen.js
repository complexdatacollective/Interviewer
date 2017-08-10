import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { Form } from '../containers/Elements';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      type: 'Alphanumeric',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://raw.githubusercontent.com/codaco/Network-Canvas-example-protocols/master/example.protocol.js',
};

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
        <h1>Get set up</h1>
        <p>Choose a protocol below.</p>
        <Form
          form={formConfig.formName}
          onSubmit={this.onClickLoadProtocol}
          initialValues={initialValues}
          {...formConfig}
        />
        <hr />
        <button onClick={this.onClickLoadDemoProtocol}>Load demo protocol</button>
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
