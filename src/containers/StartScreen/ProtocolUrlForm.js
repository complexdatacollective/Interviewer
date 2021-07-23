import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Button } from '@codaco/ui';
import { isValid } from 'redux-form';
import { Overlay } from '../Overlay';
import { importProtocolFromURI } from '../../utils/protocol/importProtocol';
import Form from '../Form';
import { required, validateUrl } from '../../utils/Validations';

const FORM_NAME = 'import_protocol_url';

const ProtocolUrlForm = ({
  show,
  handleClose,
}) => {
  const submittable = useSelector((state) => isValid(FORM_NAME)(state));

  const handleSubmit = (fields) => {
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
    <Overlay
      show={show}
      onClose={handleClose}
      title="Import Protocol from URL"
      className="protocol-url-form-overlay"
      forceDisableFullscreen
    >
      <div className="protocol-url-form">
        <p>
          Enter the full URL to a protocol file below, including
          {' '}
          <code>http://</code>
          {' '}
          or
          {' '}
          <code>https://</code>
          {' '}
          at the start.
        </p>
        <Form
          form={formConfig.formName}
          onSubmit={handleSubmit}
          initialValues={initialValues}
          autoFocus
          {...formConfig} // eslint-disable-line react/jsx-props-no-spreading
        >
          <div className="protocol-url-form__footer">
            <Button aria-label="Submit" type="submit" disabled={!submittable}>
              Import
            </Button>
          </div>
        </Form>
      </div>
    </Overlay>
  );
};

ProtocolUrlForm.defaultProps = {
  show: false,
};

ProtocolUrlForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
};

export default ProtocolUrlForm;
