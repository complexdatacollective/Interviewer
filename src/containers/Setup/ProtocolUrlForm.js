import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
  protocol_url: 'https://',
};

class ProtocolUrlForm extends Component {
  onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      this.props.importProtocolFromURI(fields.protocol_url);
    }
  }

  render() {
    return (
      <React.Fragment>
        <p>
          Enter the full URL to a protocol file below, including <code>http://</code> or <code>https://</code> at the start.
        </p>
        <Form
          className="protocol-url-form"
          form={formConfig.formName}
          onSubmit={this.onClickImportRemoteProtocol}
          initialValues={initialValues}
          {...formConfig}
        >
          <div className="protocol-import--footer">
            <Button aria-label="Submit" type="submit">
              Import
            </Button>
          </div>
        </Form>
      </React.Fragment>

    );
  }
}

ProtocolUrlForm.propTypes = {
  importProtocolFromURI: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    importProtocolFromURI:
      bindActionCreators(protocolActions.importProtocolFromURI, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ProtocolUrlForm);
