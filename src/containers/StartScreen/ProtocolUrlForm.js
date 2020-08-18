import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Overlay } from '../../containers/Overlay';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import Form from '../Form';

const formConfig = {
  formName: 'setup',
  fields: [
    {
      label: 'Protocol URL',
      name: 'protocol_url',
      component: 'Text',
      placeholder: 'Enter a valid URL...',
      required: true,
    },
  ],
};

const initialValues = {
  protocol_url: 'https://',
};

const ProtocolUrlForm = ({ show, importProtocolFromURI, handleClose }) => {
  const onClickImportRemoteProtocol = (fields) => {
    console.log('onclick', fields, importProtocolFromURI);
    if (fields) {
      importProtocolFromURI(fields.protocol_url);
      handleClose();
    }
  };

  return (
    <React.Fragment>
      <Overlay
        show={show}
        onClose={handleClose}
        title="Import Protocol from URL"
      >
        <p>
          Enter the full URL to a protocol file below, including <code>http://</code> or <code>https://</code> at the start.
        </p>
        <Form
          className="protocol-url-form"
          form={formConfig.formName}
          onSubmit={onClickImportRemoteProtocol}
          initialValues={initialValues}
          {...formConfig}
        >
          <div className="protocol-import--footer">
            <Button aria-label="Submit" type="submit">
              Import
            </Button>
          </div>
        </Form>
      </Overlay>
    </React.Fragment>
  );
};

ProtocolUrlForm.defaultProps = {
  show: false,
};

ProtocolUrlForm.propTypes = {
  importProtocolFromURI: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
};

const mapDispatchToProps = dispatch => ({
  importProtocolFromURI: uri => dispatch(protocolActions.importProtocolFromURI(uri)),
});

export { ProtocolUrlForm };

export default connect(null, mapDispatchToProps)(ProtocolUrlForm);
