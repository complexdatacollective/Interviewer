/* eslint-disable */
/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import validations from '../../utils/Validations';
import components from '../../utils/fieldComponents';
import { withOptionsFromSelector } from '../../behaviors';

const getComponent = type => (
  Object.hasOwnProperty.call(components, type) ?
  components[type] :
  () => (<div>Field type not defined</div>)
);

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
const Field = ({ label, name, type, validation, optionsSelector, ...rest }) => {
  const validate = getValidation(validation);
  let component = getComponent(type);
  if (optionsSelector) { component = withOptionsFromSelector(component, optionsSelector); }
  return (
    <ReduxFormField
      name={name}
      label={label}
      component={component}
      validate={validate}
      {...rest}
    />
  );
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  optionsSelector: PropTypes.func,
  validation: PropTypes.object,
};

Field.defaultProps = {
  validation: {},
  optionsSelector: null,
};

export default Field;
