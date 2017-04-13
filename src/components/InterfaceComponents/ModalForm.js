import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { required } from '../../utils/Validations';

import { Input, Form } from 'semantic-ui-react';

class ModalForm extends Component {
  textField = ({ input, label }) => {
    return (
      <Input label={label} {...input} />
    );
  }

  render() {
    const {
      props: {
        handleSubmit,
        submitButton,
        fields
      },
      textField
    } = this;

    return (
      <Form onSubmit={ handleSubmit }>
        { fields.map((field) => {
          return (
            <Form.Field>
              <Field name={ field.name } component={ textField } label={ field.label } validate={[ required ]}/>
            </Form.Field>
          );
        }) }
        {submitButton}
      </Form>
    )
  }
}

ModalForm = reduxForm()(ModalForm);

export default ModalForm;
