import React from 'react';
import PropTypes from 'prop-types';
import { Field } from '../../containers/Elements';

const Form = ({ fields, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    { fields.map((field, index) => (
      <Field key={index} {...field} />
    )) }
    <br />
    <button type="submit">Submit</button>
  </form>
);

Form.propTypes = {
  fields: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default Form;
