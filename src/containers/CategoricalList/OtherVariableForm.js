import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Button, Node } from '@codaco/ui';
import Field from '../Field';
import './OtherVariableForm.scss';

const stopClickPropagation = e =>
  e.stopPropagation();

const OtherVariableForm = ({
  otherVariableLabel,
  handleSubmit,
  color,
  label,
  onCancel,
}) => (
  <div className="other-variable-form" onClick={stopClickPropagation}>
    <form onSubmit={handleSubmit}>
      <div className="other-variable-form__header">
        <h2>Set {otherVariableLabel}</h2>
      </div>

      <div className="other-variable-form__content">
        <div className="other-variable-form__content-left">
          <Node label={label} color={color} />
        </div>
        <div className="other-variable-form__content-right">
          <Field
            label={otherVariableLabel}
            component="Text"
            name="otherVariable"
            validation={{ required: true }}
          />
        </div>
      </div>
      <div className="other-variable-form__footer">
        <Button type="button" color="white" onClick={onCancel}>Cancel</Button>
        <Button type="submit" aria-label="Submit" >Set {otherVariableLabel}</Button>
      </div>
    </form>
  </div>
);

OtherVariableForm.propTypes = {
  otherVariableLabel: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default reduxForm({ form: 'otherVariableForm' })(OtherVariableForm);
