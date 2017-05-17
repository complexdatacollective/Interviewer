/* eslint-disable */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { Form } from '../components/Elements';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      type: 'text',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://raw.githubusercontent.com/codaco/Network-Canvas-example-protocols/master/advanced.protocol',
};

class Setup extends Component {
  handleLoadProtocol = (fields, _, form) => {
    if (fields) {
      this.props.loadProtocol(fields.protocol_url);
      form.reset();
    }
  }

  render() {
    if(this.props.protocolLoaded) { return (<Redirect to={{ pathname: '/protocol' }}/>); }
    return (
      <div className="setup">
        <h1>Get set up</h1>
        <p>Choose a protocol below.</p>
        <Form
          form={formConfig.formName}
          onSubmit={this.handleLoadProtocol}
          initialValues={initialValues}
          {...formConfig}
        />
      </div>
    );
  }
}

Setup.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolLoaded: state.protocol.loaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
