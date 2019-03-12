import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Form from '../Form';
import { Button } from '../../ui/components';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      component: 'Text',
      placeholder: 'Protocol URL',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'http://localhost:8000/development-11.netcanvas',
};

class ProtocolUrlForm extends Component {
  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.downloadAndInstallProtocol(fields.protocol_url);
      this.props.handleProtocolUpdate();
    }
  }

  render() {
    const { onCancel } = this.props;
    return (
      <React.Fragment>
        <Form
          className="protocol-url-form"
          form={formConfig.formName}
          onSubmit={this.onClickImportRemoteProtocol}
          initialValues={initialValues}
          {...formConfig}
        >
          <Button aria-label="Submit" type="submit">
            Import
          </Button>
          <Button color="platinum" aria-label="Cancel" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </Form>
      </React.Fragment>

    );
  }
}

ProtocolUrlForm.propTypes = {
  downloadAndInstallProtocol: PropTypes.func.isRequired,
  handleProtocolUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    downloadAndInstallProtocol:
      bindActionCreators(protocolActions.downloadAndInstallProtocol, dispatch),
    handleProtocolUpdate: () => {
      dispatch(push('/'));
    },
  };
}

export default connect(null, mapDispatchToProps)(ProtocolUrlForm);
