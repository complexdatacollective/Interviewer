import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { Form, Dialog } from '../containers/';
import { isElectron, isCordova } from '../utils/Environment';
import ServerDiscoverer from '../utils/serverDiscoverer';
import logo from '../images/NC-Round.svg';

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

    this.state = {
      serverDiscoveryDialog: {
        title: 'Server Dialog',
        type: 'info',
        additionalInformation: '',
        content: null,
        onConfirm: () => {},
        confirmLabel: 'Continue',
        hasCancelButton: false,
      },
    };
  }

  componentWillMount() {
    this.serverDiscoverer.on('SERVICE_ANNOUNCED', (response) => {
      this.setState({
        serverDiscoveryDialog: {
          title: 'Network Canvas Server Found!',
          type: 'info',
          additionalInformation: JSON.stringify(response),
          content: 'An installation of Network Canvas Server has been found nearby.',
          onConfirm: () => {},
          confirmLabel: 'Great!',
          hasCancelButton: false,
        },
      }, () => {
        this.props.openModal('SERVER_DISCOVERY');
      });
    });

    this.serverDiscoverer.on('SERVICE_RESOLVED', (response) => {
      this.setState({
        serverDiscoveryDialog: {
          title: 'Network Canvas Server Resolved!',
          type: 'info',
          additionalInformation: JSON.stringify(response),
          content: 'An installation of Network Canvas Server has been resolved nearby.',
          onConfirm: () => {},
          confirmLabel: 'Great!',
          hasCancelButton: false,
        },
      }, () => {
        this.props.openModal('SERVER_DISCOVERY');
      });
    });

    this.serverDiscoverer.on('SERVICE_REMOVED', () => {
      this.props.closeModal('SERVER_DISCOVERY');
    });
  onClickLoadFactoryProtocol = (protocolName) => {
    this.props.loadFactoryProtocol(protocolName);
  }

  onClickLoadFactoryProtocol = () => {
    this.props.loadFactoryProtocol('demo.canvas');
  }

  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.downloadProtocol(fields.protocol_url);
    }
  }

  renderImportButtons() {
    if (isElectron() || isCordova()) {
      return (
        <div>
          <div className="setup__custom-protocol">
            <Form
              form={formConfig.formName}
              onSubmit={this.onClickImportRemoteProtocol}
              initialValues={initialValues}
              controls={[<Button size="small" key="submit" aria-label="Import remote protocol">Import remote protocol</Button>]}
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
        <Dialog
          name="SERVER_DISCOVERY"
          title={this.state.serverDiscoveryDialog.title}
          type={this.state.serverDiscoveryDialog.type}
          confirmLabel={this.state.serverDiscoveryDialog.confirmLabel}
          hasCancelButton={this.state.serverDiscoveryDialog.hasCancelButton}
          additionalInformation={this.state.serverDiscoveryDialog.additionalInformation}
          onConfirm={this.state.serverDiscoveryDialog.onConfirm}
        >
          {this.state.serverDiscoveryDialog.content}
        </Dialog>
        <div className="setup__header">
          <img src={logo} className="logo" alt="Network Canvas" />
          <h1 className="type--title-1">Welcome to Network Canvas Alpha 2 - Milliways</h1>
        </div>
        <p>
          Thank you for taking the time to explore this exciting new chapter in
          the development of our software. Help us to improve by giving feedback on our <u><a href="http://feedback.networkcanvas.com/">feedback website</a></u>
        </p>
        <br />

        <div className="setup__start">
          {this.renderImportButtons()}
          <p>
            <Button size="small" onClick={() => this.onClickLoadFactoryProtocol('education.netcanvas')} content="Load teaching protocol" />&nbsp;
            <Button size="small" color="platinum" onClick={() => this.onClickLoadFactoryProtocol('development.netcanvas')} content="Load development protocol" />
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
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
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
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
