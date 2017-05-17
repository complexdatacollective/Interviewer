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
        <br />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

Form = reduxForm({
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true
})(Form);

export default Form;
