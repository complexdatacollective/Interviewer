import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
import Overlay from '../Overlay';
import Form from '../Form';
import { required, maxLength } from '../../utils/Validations';

const NewSessionOverlay = ({
  handleSubmit,
  show,
  onClose,
}) => {
  const formConfig = {
    formName: 'case-id-form',
    fields: [
      {
        label: null,
        name: 'case_id',
        component: 'Text',
        placeholder: 'Enter a unique case ID',
        validate: [required('You must enter a case ID before you can continue.'), maxLength(30)],
      },
    ],
  };

  const onSubmitForm = (fields) => {
    handleSubmit(fields.case_id);
  };

  return (
    <Overlay
      show={show}
      title="Enter a Case ID"
      onClose={onClose}
      forceDisableFullscreen
    >
      <div className="case-id-form">
        <p>
          Before the interview begins, enter a case ID.
          This will be shown on the resume interview screen to help you quickly
          identify this session.
        </p>
        <Form
          className="case-id-form__form"
          form={formConfig.formName}
          autoFocus
          onSubmit={onSubmitForm}
          {...formConfig} // eslint-disable-line react/jsx-props-no-spreading
        >
          <div className="case-id-form__footer">
            <Button aria-label="Submit" type="submit">
              Start interview
            </Button>
          </div>
        </Form>
      </div>
    </Overlay>
  );
};

NewSessionOverlay.propTypes = {
  show: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

NewSessionOverlay.defaultProps = {
  show: false,
  onClose: () => {},
};

export default NewSessionOverlay;
