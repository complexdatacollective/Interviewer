import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Form from '../Form';
import { Button, Icon } from '../../ui/components';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';

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
  protocol_url: 'https://',
};

class ProtocolUrlForm extends Component {
  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.addSession();
      this.props.downloadProtocol(fields.protocol_url);
      this.props.handleProtocolUpdate();
    }
  }

  render() {
    const { onCancel } = this.props;
    return (
      <Form
        className="protocol-url-form"
        form={formConfig.formName}
        onSubmit={this.onClickImportRemoteProtocol}
        initialValues={initialValues}
        controls={[
          <Button
            onClick={onCancel}
            key="cancel"
            color="platinum"
            icon={<Icon name="close" />}
            content="Cancel"
            type="button"
          />,
          <Button key="submit" type="submit">Import remote protocol</Button>,
        ]}
        {...formConfig}
      />
    );
  }
}

ProtocolUrlForm.propTypes = {
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  handleProtocolUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    handleProtocolUpdate: () => {
      dispatch(push('/'));
    },
  };
}

export default connect(null, mapDispatchToProps)(ProtocolUrlForm);
