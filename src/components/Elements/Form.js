import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import TextInput from '../../components/Form/TextInput';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
const Form = props => (
  <form onSubmit={props.handleSubmit}>
    { props.fields.map((field, index) => (
      <TextInput key={index} {...field} />
    )) }
    <br />
    <button type="submit">Submit</button>
  </form>
);

Form.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default reduxForm({
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
})(Form);
