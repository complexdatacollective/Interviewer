import React from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map } from 'lodash';

// TODO: Seems like this knowledge should be part of the field component?
const typeInitalValue = (field) => {
  switch (field.type) {
    case 'CheckboxGroup':
    case 'ToggleGroup':
      return fromPairs(map(field.options, (option) => [option, false]));
    default:
      return '';
  }
};

const initialValues = (fields) => fromPairs(
  map(fields, (field) => [field.name, typeInitalValue(field)]),
);

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
const autoInitialisedForm = (WrappedComponent) => {
  const AutoInitialisedForm = (props) => {
    const { fields } = props;
    return <WrappedComponent initialValues={initialValues(fields)} {...props} />;
  };

  AutoInitialisedForm.propTypes = {
    fields: PropTypes.array.isRequired,
  };

  return AutoInitialisedForm;
};

export default autoInitialisedForm;
