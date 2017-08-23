/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import {
  TextInput as Alphanumeric,
  RadioGroup,
  ToggleGroup as SwitchGroup,
} from 'network-canvas-ui';

import validations from '../../utils/Validations';

import { withOptionsFromSelector } from '../../behaviours';

/**
  * Returns the named field compontent, if no matching one is found
  or else it just returns a text input
  * @param {object} field The properties handed down from the protocol form
  */

export const renderInput = (field) => {
  const {
    type,
    input,
    meta,
    label,
    options,
    optionsSelector,
  } = field;
  let InputComponent = Alphanumeric;

  let inputProps = {
    name: input.name,
    value: input.value,
    errorText: meta.invalid && meta.dirty && meta.error,
    label,
  };

  if (type === 'Numeric') {
    inputProps = {
      ...inputProps,
      isNumericOnly: true,
    };
  }

  if (type === 'RadioGroup') {
    InputComponent = RadioGroup;
    inputProps = {
      ...inputProps,
      options,
      onRadioClick: input.onChange,
    };
  }

  if (type === 'CheckboxGroup') {
    InputComponent = SwitchGroup;
    inputProps = {
      ...inputProps,
      toggleComponent: 'checkbox',
      options,
      onOptionClick: (e, checked, optionVal) => input.onChange({
        ...input.value,
        [optionVal]: checked,
      }),
    };
  }

  if (type === 'ToggleGroup') {
    const { colors } = field;
    InputComponent = SwitchGroup;
    inputProps = {
      ...inputProps,
      toggleComponent: 'context',
      options,
      colors,
      onOptionClick: (e, checked, optionVal) => input.onChange({
        ...input.value,
        [optionVal]: checked,
      }),
    };
  }

  if (optionsSelector) {
    InputComponent = withOptionsFromSelector(InputComponent, optionsSelector);
  }

  return (
    <InputComponent
      {...inputProps}
      {...input}
    />
  );
};

/**
* Returns the named validation function, if no matching one is found it returns a validation
* which will always fail.
* @param {string} validation The name of the validation function to return.
  */
const getValidation = validation =>
  map(
    toPairs(validation),
    ([type, options]) => (
      Object.hasOwnProperty.call(validations, type) ? validations[type](options) : () => (`Validation "${type}" not found`)
    ),
  );

/**
  * Renders a redux-form field in the style of our app.
  * @param {string} label Presentational label
  * @param {string} name Property name
  * @param {string} type Field component type
  * @param {string} placeholder Presentational placeholder text
  * @param {object} validation Validation methods
  */
const Field = ({ label, name, type, validation, optionsSelector, ...rest }) => {
  const validate = getValidation(validation);

  return (
    <ReduxFormField
      name={name}
      label={label}
      component={renderInput}
      validate={validate}
      optionsSelector={optionsSelector}
      type={type}
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
