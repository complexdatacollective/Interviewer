import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { fromPairs, map } from 'lodash';
import Field from '../../containers/Elements/Input';

const typeInitalValue = (field) => {
  switch (field.type) {
    case 'checkbox_group':
      return fromPairs(map(field.options, option => [option, false]));
    case 'checkbox_list':
      return [];
    default:
      return '';
  }
};

const initialValues = fields =>
  fromPairs(map(fields, field => [field.name, typeInitalValue(field)]));

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

const ReduxedForm = reduxForm({
  destroyOnUnmount: true,
  forceUnregisterOnUnmount: true,
})(Form);

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
const AutoInitialisedForm = props =>
  <ReduxedForm initialValues={initialValues(props.fields)} {...props} />;

AutoInitialisedForm.propTypes = {
  fields: PropTypes.array.isRequired,
};

export default AutoInitialisedForm;
