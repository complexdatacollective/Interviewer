/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import validations from '../../utils/validations';
import components from '../../utils/fieldComponents';

const getComponent = type =>
  (Object.hasOwnProperty.call(components, type) ? components[type] : components.text);

const getValidation = validation =>
  map(
    toPairs(validation),
    ([type, options]) => (
      Object.hasOwnProperty.call(validations, type) ? validations[type](options) : () => (`Validation "${type}" not found`)
    ),
  );

/**
  * Renders a redux form field in the style of our app.
  */
const Input = ({ label, name, type, validation }) => {
  const component = getComponent(type);
  const validate = getValidation(validation);

  return (
    <ReduxFormField name={name} label={label} component={component} validate={validate} />
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  validation: PropTypes.object,
};

Input.defaultProps = {
  validation: {},
};

export default Input;
