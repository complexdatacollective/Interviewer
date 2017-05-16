/* eslint-disable */

import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import TextInput from '../../components/Form/TextInput';

class Form extends Component {
  render() {
    const {
      props: {
        handleSubmit,
        fields
      }
    } = this;

    return (
      <form onSubmit={ handleSubmit }>
        { fields.map((field, index) => {
          return <TextInput key={ index } { ...field } />;
        }) }
        <button type="submit">Submit</button>
      </form>
    )
  }
}

Form = reduxForm({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true
})(Form);

export default Form;
