import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Button } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as modalActions } from '../ducks/modules/modals';
import { ServerList } from '../components/';
import { Form } from '../containers/';
import { isElectron, isCordova } from '../utils/Environment';
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
  protocol_url: 'https://github.com/codaco/example-protocols/raw/master/packaged/demo.netcanvas',
};

/**
  * Setup screen
  * @extends Component
  */
class Setup extends Component {
  onClickLoadFactoryProtocol = (protocolName) => {
    this.props.loadFactoryProtocol(protocolName);
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
          <Form
            className="setup__custom-protocol"
            form={formConfig.formName}
            onSubmit={this.onClickImportRemoteProtocol}
            initialValues={initialValues}
            controls={[<Button size="small" key="submit" aria-label="Import remote protocol">Import remote protocol</Button>]}
            {...formConfig}
          />
        </div>
      );
    }

    return null;
  }

  render() {
    if (this.props.isProtocolLoaded) { return (<Redirect to={{ pathname: `/protocol/${this.props.protocolPath}/0` }} />); }

    return (
      <div className="setup">
        <div className="setup__header">
          <h1 className="type--title-1"><img src={logo} className="logo" alt="Network Canvas" /> Network Canvas Alpha 3 - Tiburon</h1>
        </div>
        {this.renderImportButtons()}
        <div className="setup__start">
          <ServerList />
          <div className="setup__factory-protocol">
            <Button size="small" onClick={() => this.onClickLoadFactoryProtocol('education.netcanvas')} content="Load teaching protocol" />&nbsp;
            <Button size="small" color="platinum" onClick={() => this.onClickLoadFactoryProtocol('development.netcanvas')} content="Load dev protocol" />
          </div>
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  downloadProtocol: PropTypes.func.isRequired,
  importProtocol: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
};

Setup.defaultProps = {
  protocolPath: '',
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    importProtocol: bindActionCreators(protocolActions.importProtocol, dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setup));
