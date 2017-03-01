import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';

import { Input, Form } from 'semantic-ui-react';

class NameGeneratorForm extends Component {
  textField = ({ input, label, meta: { touched, error }}) => {
    return (
      <Input label={label} {...input} />
    );
  }

  render() {
    const {
      props: {
        fieldName,
        handleSubmit,
        submitButton
      },
      textField
    } = this;

    return (
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <Field name={fieldName} component={textField} />
        </Form.Field>
        {submitButton}
      </Form>
    )
  }
}

NameGeneratorForm.propTypes = {
  fieldName: React.PropTypes.string,
  fieldLabel: React.PropTypes.string,
  multiple: React.PropTypes.bool
}

NameGeneratorForm = reduxForm({
  form: 'protocolForm'
})(NameGeneratorForm);

export default NameGeneratorForm;
