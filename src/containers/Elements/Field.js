/* eslint-disable jsx-a11y/label-has-for */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import {
  TextInput,
  RadioGroup,
  ToggleGroup,
} from 'network-canvas-ui';

import validations from '../../utils/Validations';

import { withOptionsFromSelector } from '../../behaviours';

/*
  * Returns the named field compontent, if no matching one is found
  or else it just returns a text input
  * @param {object} field The properties handed down from the protocol form
  */

export const makeRenderInput = (type) => {
  const renderInput = (field) => {
    const {
      input,
      meta,
      label,
      options,
      optionsSelector,
      isNumericOnly,
      toggleComponent,
      autoFocus,
      className,
    } = field;

    let InputComponent = TextInput;

    let inputProps = {
      name: input.name,
      value: input.value,
      errorText: meta.invalid && meta.touched && meta.error,
      label,
      autoFocus,
      isNumericOnly,
      className,
    };

    if (type === 'RadioGroup') {
      InputComponent = RadioGroup;
      inputProps = {
        ...inputProps,
        options,
        onRadioClick: input.onChange,
      };
    }

    if (type === 'CheckboxGroup') {
      const { colors } = field;
      InputComponent = ToggleGroup;
      inputProps = {
        ...inputProps,
        toggleComponent,
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

    return <InputComponent {...inputProps} {...input} />;
  };

  return renderInput;
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
  * @param {string} component Field component
  * @param {string} placeholder Presentational placeholder text
  * @param {object} validation Validation methods
  */
class Field extends PureComponent {
  constructor(props) {
    super(props);
    this.component = (typeof props.component === 'string') ? makeRenderInput(props.component) : props.component;
  }

  render() {
    const { label, name, validation, ...rest } = this.props;

    const validate = getValidation(validation);

    return (
      <ReduxFormField
        {...rest}
        name={name}
        label={label}
        component={this.component}
        validate={validate}
      />
    );
  }
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  validation: PropTypes.object,
};

Field.defaultProps = {
  validation: {},
};

export default Field;
