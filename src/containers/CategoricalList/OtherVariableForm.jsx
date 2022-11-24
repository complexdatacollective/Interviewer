import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { Button, Node } from '@codaco/ui';
import { MarkdownLabel } from '@codaco/ui/lib/components/Fields';
import Field from '../Field';

const stopClickPropagation = (e) => e.stopPropagation();

const OtherVariableForm = ({
  otherVariablePrompt,
  handleSubmit,
  color,
  label,
  onCancel,
}) => (
  <div className="other-variable-form" onClick={stopClickPropagation}>
    <form onSubmit={handleSubmit}>
      <div className="other-variable-form__content">
        <div className="other-variable-form__content-left">
          <Node label={label} color={color} />
        </div>
        <div className="other-variable-form__content-right">
          <h4>
            <MarkdownLabel inline label={otherVariablePrompt} />
          </h4>
          <Field
            label=""
            placeholder="Enter your response here..."
            component="Text"
            name="otherVariable"
            validation={{ required: true }}
          />
        </div>
      </div>
      <div className="other-variable-form__footer">
        <Button type="button" color="white" onClick={onCancel}>Cancel</Button>
        <Button type="submit" aria-label="Submit">Continue</Button>
      </div>
    </form>
  </div>
);

OtherVariableForm.propTypes = {
  otherVariablePrompt: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default reduxForm({ form: 'otherVariableForm' })(OtherVariableForm);
