import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { required } from '../../utils/Validations';

import { Input, Form } from 'semantic-ui-react';

class ParticipantForm extends Component {
  textField = ({ input, label, meta: { touched, error }}) => {
    return (
      <Input label={label} {...input} />
    );
  }

  render() {
    const {
      props: {
        handleSubmit,
        submitButton
      },
      textField
    } = this;

    return (
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <Field name='fName' component={textField} label='First name' validate={[required]}/>
        </Form.Field>
        <Form.Field>
          <Field name='lName' component={textField} label='Last name' validate={[required]}/>
        </Form.Field>
        {submitButton}
      </Form>
    )
  }
}

ParticipantForm = reduxForm({
  form: 'node'
})(ParticipantForm);

export default ParticipantForm;
