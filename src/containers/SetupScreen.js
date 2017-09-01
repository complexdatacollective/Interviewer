import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'network-canvas-ui';
import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { Form, Dialog } from '../containers/Elements';

import {
  actionCreators as modalActions,
  modalNames as modals,
} from '../ducks/modules/modals';

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

  onDialogConfirm = () => {
    // eslint-disable-next-line no-console
    console.log('dialog confirmed');
  }

  onDialogCancel = () => {
    // eslint-disable-next-line no-console
    console.log('dialog cancelled');
  }

  render() {
    if (this.props.protocolLoaded) { return (<Redirect to={{ pathname: '/protocol' }} />); }

    const {
      openModal,
    } = this.props;

    return (
      <div className="setup">
        <h1 className="type--title-1">Welcome to Network Canvas</h1>
        <p>
          Thank you for taking the time to explore this exciting new chapter in
          the development of our software.
        </p>
        <h2 className="type--title-2">Help us to improve</h2>
        <p>
          Help us in this way.
        </p>
        <Form
          form={formConfig.formName}
          onSubmit={this.onClickLoadProtocol}
          initialValues={initialValues}
          {...formConfig}
        />
        <hr />
        <Button onClick={this.onClickLoadDemoProtocol} content="Load demo protocol" />
        <hr />
        <Dialog
          name={modals.INFO_DIALOG}
          title="Some information for the user"
          type="info"
          confirmLabel="Thanks"
          onConfirm={this.onDialogConfirm}
          onCancel={this.onDialogCancel}
        >
          <p>Some information to present to the user in this informative prompt.</p>
        </Dialog>
        <Button onClick={() => openModal(modals.INFO_DIALOG)}>
          Info
        </Button>

        <Dialog
          name={modals.WARNING_DIALOG}
          title="A warning for the user"
          type="warning"
          confirmLabel="Understood"
          cancelLabel="Take me back"
          onConfirm={this.onDialogConfirm}
          onCancel={this.onDialogCancel}
        >
          <p>A warning to present to the user in this informative prompt.</p>
        </Dialog>
        <Button onClick={() => openModal(modals.WARNING_DIALOG)}>
          Warning
        </Button>

        <Dialog
          name={modals.ERROR_DIALOG}
          title="An error message for the user"
          type="error"
          hasCancelButton={false}
          confirmLabel="Uh-oh"
          onConfirm={this.onDialogConfirm}
        >
          <p>An error state to present to the user in this informative prompt.</p>
        </Dialog>
        <Button onClick={() => openModal(modals.ERROR_DIALOG)}>
          Error
        </Button>
      </div>
    );
  }
}

Setup.propTypes = {
  protocolLoaded: PropTypes.bool.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  loadDemoProtocol: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
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
    closeModal: bindActionCreators(modalActions.closeModal, dispatch),
    openModal: bindActionCreators(modalActions.openModal, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setup);
