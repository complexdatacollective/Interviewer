import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { Form } from '../containers/';
import importer from '../utils/importer';
import { isElectron, isCordova } from '../utils/Environment';
import importRemoteProtocol from '../utils/protocol/importRemoteProtocol';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      component: 'TextInput',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://github.com/codaco/Network-Canvas/raw/7f3766f3275e6f74d6a2ddfebc29b0da4e3b3e30/public/demo.canvas',
};

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  onClickLoadProtocol = (fields) => {
    if (fields) {
      importRemoteProtocol(fields.protocol_url);
    }
  }

  onClickLoadDemoProtocol = () => {
    this.props.loadDemoProtocol();
  }

  onClickLoadImportedProtocol = () => {
    console.log('Loading "demo.canvas"');
    this.props.loadProtocol('demo.canvas');
  }

  onClickImportProtocol = () => {
    console.log('Importing "demo.canvas"');
    importer('Path to protocol here');
  }

  onDialogConfirm = () => {
    // eslint-disable-next-line no-console
    console.log('dialog confirmed');
  }

  onDialogCancel = () => {
    // eslint-disable-next-line no-console
    console.log('dialog cancelled');
  }

  renderImportButtons() {
    if (isElectron() || isCordova()) {
      return (
        <p>
          <Button onClick={this.onClickImportProtocol} content="Import demo protocol" /><br />
          <br />
          <Button onClick={this.onClickLoadImportedProtocol} content="Load imported demo protocol" />
          <hr />
        </p>
      );
    }

    return null;
  }

  render() {
    if (this.props.isProtocolLoaded) { return (<Redirect to={{ pathname: '/protocol' }} />); }

    return (
      <div className="setup">
        <h1 className="type--title-1">Welcome to Network Canvas</h1>
        <p>
          Thank you for taking the time to explore this exciting new chapter in
          the development of our software.
        </p>
        <h2 className="type--title-2">Help us to improve</h2>
        <p>
          You can help us by giving feedback on
          our <u><a href="http://feedback.networkcanvas.com/">feedback website</a></u>
        </p>
        <br />
        <hr />
        <br />

        <div className="setup__start">

          {this.renderImportButtons()}

          <p>
            <Button onClick={this.onClickLoadDemoProtocol} content="Load demo protocol" />
          </p>

          <p>Or load a custom one:</p>

          <div className="setup__custom-protocol">
            <Form
              form={formConfig.formName}
              onSubmit={this.onClickLoadProtocol}
              initialValues={initialValues}
              {...formConfig}
            />
          </div>
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  loadDemoProtocol: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    loadDemoProtocol: bindActionCreators(protocolActions.loadDemoProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
