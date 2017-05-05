import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { required } from '../../utils/Validations';

import { Input, Form as SemanticForm } from 'semantic-ui-react';

class Form extends Component {
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
      <SemanticForm onSubmit={ handleSubmit }>
        <h4>{ this.props.title }</h4>
        { fields.map((field, index) => {
          return (
            <Field key={ index } name={ field.name } component={ textField } label={ field.label } validate={[ required ]}/>
          );
        }) }
        <button type="submit">Submit</button>
      </SemanticForm>
    )
  }
}

Form = reduxForm({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true
})(Form);

export default Form;
