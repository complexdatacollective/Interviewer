/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { autoInitialisedForm } from '../../behaviors';
import { Field } from '../../containers/Elements';

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
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

export default autoInitialisedForm(reduxForm({
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
})(Form));
