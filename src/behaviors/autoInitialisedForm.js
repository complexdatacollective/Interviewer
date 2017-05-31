import React from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map } from 'lodash';

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

/**
  * Renders a redux form that contains fields according to a `fields` config.
  */
const autoInitialisedForm = (WrappedComponent) => {
  const AutoInitialisedForm = props => (
    <WrappedComponent initialValues={initialValues(props.fields)} {...props} />
  );

  AutoInitialisedForm.propTypes = {
    fields: PropTypes.array.isRequired,
  };

  return AutoInitialisedForm;
};

export default autoInitialisedForm;
