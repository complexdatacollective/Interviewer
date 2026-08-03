import PropTypes from 'prop-types';

import { Button } from '@codaco/ui';

import { maxLength, required } from '../../utils/Validations';
import Form from '../Form';
import Overlay from '../Overlay';

// Defined at module scope so the field `validate` functions keep a stable
// identity across renders; otherwise redux-form re-registers/re-validates the
// field on every store change, causing an infinite update loop.
const formConfig = {
  formName: 'case-id-form',
  fields: [
    {
      label: null,
      name: 'case_id',
      component: 'Text',
      placeholder: 'Enter a unique case ID',
      validate: [
        required('You must enter a case ID before you can continue.'),
        maxLength(30),
      ],
    },
  ],
};

const NewSessionOverlay = ({ handleSubmit, show, onClose }) => {
  const onSubmitForm = (fields) => {
    handleSubmit(fields.case_id);
  };

  return (
    <Overlay
      show={show}
      title="Enter a Case ID"
      onClose={onClose}
      forceDisableFullscreen
      className="case-id-form-overlay"
    >
      <div className="case-id-form">
        <p>
          Before the interview begins, enter a case ID. This will be shown on
          the resume interview screen to help you quickly identify this session.
        </p>
        <Form
          className="case-id-form__form"
          form={formConfig.formName}
          subject={{ entity: 'ego' }}
          autoFocus
          onSubmit={onSubmitForm}
          {...formConfig}
        >
          <div
            className="case-id-form__footer"
            style={{ marginBottom: '1.2rem' }}
          >
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
