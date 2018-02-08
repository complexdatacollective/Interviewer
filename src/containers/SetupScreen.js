import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { Form } from '../containers/';
import { isElectron, isCordova } from '../utils/Environment';
import ServerDiscoverer from '../utils/serverDiscoverer';

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

// const initialState = {
//   serverDiscoveryModal: {
//     title: 'Server Discovery',
//     type: 'info',
//     additionalInformation: '',
//     content: null,
//     onConfirm: () => { },
//     confirmLabel: 'Continue',
//     hasCancelButton: true,
//   },
// };

const initialValues = {
  protocol_url: 'https://github.com/codaco/example-protocols/raw/master/packaged/demo.canvas',
};

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  constructor() {
    super();

    this.serverDiscoverer = new ServerDiscoverer();
    console.log(this.serverDiscoverer);
  }

  componentWillMount() {
    this.serverDiscoverer.on('SERVICE_ANNOUNCED', (response) => {
      console.log(response);
    });
  }

  componentWillUnmount() {
    this.props.unregisterModal('SERVER_DISCOVERY');
  }

  onClickLoadFactoryProtocol = () => {
    this.props.loadFactoryProtocol('demo.canvas');
  }

  onDialogConfirm = () => {
    // eslint-disable-next-line no-console
    console.log('dialog confirmed');
  }

  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.downloadProtocol(fields.protocol_url);
    }
  }

  onDialogCancel = () => {
    // eslint-disable-next-line no-console
    console.log('dialog cancelled');
  }

  renderImportButtons() {
    if (isElectron() || isCordova()) {
      return (
        <div>
          <p>Import a custom protocol:</p>
          <div className="setup__custom-protocol">
            <Form
              form={formConfig.formName}
              onSubmit={this.onClickImportRemoteProtocol}
              initialValues={initialValues}
              controls={[<Button key="submit" aria-label="Import remote protocol">Import remote protocol</Button>]}
              {...formConfig}
            />
          </div>
          <br />
          <hr />
          <br />
        </div>
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
            <Button onClick={this.onClickLoadFactoryProtocol} content="Load demo protocol" />
          </p>
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  importProtocol: PropTypes.func.isRequired,
  registerModal: PropTypes.func.isRequired,
  unregisterModal: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    importProtocol: bindActionCreators(protocolActions.importProtocol, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    registerModal: bindActionCreators(modalActions.registerModal, dispatch),
    unregisterModal: bindActionCreators(modalActions.unregisterModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
