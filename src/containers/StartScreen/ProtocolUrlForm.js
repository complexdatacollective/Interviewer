import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { isValid } from 'redux-form';
import { Overlay } from '../../containers/Overlay';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import Form from '../Form';
import { required, validateUrl } from '../../utils/Validations';

const FORM_NAME = 'import_protocol_url';

const ProtocolUrlForm = ({
  show,
  importProtocolFromURI,
  handleClose,
  submittable,
}) => {
  const onClickImportRemoteProtocol = (fields) => {
    if (fields) {
      importProtocolFromURI(fields.protocol_url).then(() => {
        handleClose();
      }, () => {
        // Keep dialog open so user can retry after error.
      });
    }
  };

  const formConfig = {
    formName: FORM_NAME,
    fields: [
      {
        label: 'Protocol URL',
        name: 'protocol_url',
        component: 'Text',
        placeholder: 'Enter a valid URL...',
        validate: [required('Please enter a URL here.'), validateUrl()],
      },
    ],
  };

  const initialValues = {
    protocol_url: 'https://',
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
          autoFocus
          {...formConfig}
        >
          <div className="protocol-import--footer">
            <Button aria-label="Submit" type="submit" disabled={!submittable}>
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

const mapStateToProps = state => ({
  submittable: isValid(FORM_NAME)(state),
});

export { ProtocolUrlForm };

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolUrlForm);
