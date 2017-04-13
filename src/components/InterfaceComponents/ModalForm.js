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
        fields
      },
      textField
    } = this;

    return (
      <Form onSubmit={ handleSubmit }>
        { fields.map((field, index) => {
          return (
            <Field key={ index } name={ field.name } component={ textField } label={ field.label } validate={[ required ]}/>
          );
        }) }
        <button type="submit">Submit</button>
      </Form>
    )
  }
}

ModalForm = reduxForm({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true
})(ModalForm);

export default ModalForm;
