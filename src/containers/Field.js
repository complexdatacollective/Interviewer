import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, get, toPairs } from 'lodash';
import {
  Checkbox,
  CheckboxGroup,
  ToggleButtonGroup,
  ToggleButton,
  RadioGroup,
  Text,
  Number as NumberField,
  Toggle,
} from '../ui/components/Fields';

import validations from '../utils/Validations';
import { FormComponent } from '../protocol-consts';

/*
  * Returns the named field compontent, if no matching one is found
  or else it just returns a text input
  * @param {object} field The properties handed down from the protocol form
  */

const fieldTypes = {
  [FormComponent.Checkbox]: Checkbox,
  [FormComponent.CheckboxGroup]: CheckboxGroup,
  [FormComponent.RadioGroup]: RadioGroup,
  [FormComponent.Text]: Text,
  [FormComponent.Number]: NumberField,
  [FormComponent.Toggle]: Toggle,
  [FormComponent.ToggleButtonGroup]: ToggleButtonGroup,
  [FormComponent.hidden]: props => <input {...props} type="hidden" />,
};

const ComponentTypeNotFound = componentType =>
  () => (<div>Input component {componentType} not found.</div>);

export const getInputComponent = componentType =>
  get(
    fieldTypes,
    componentType,
    ComponentTypeNotFound(componentType),
  );

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
    this.component = (typeof props.component === 'string') ? getInputComponent(props.component) : props.component;
    this.validate = getValidation(props.validation);
  }

  render() {
    const { label, name, validation, ...rest } = this.props;
    return (
      <ReduxFormField
        {...rest}
        name={name}
        label={label}
        component={this.component}
        validate={this.validate}
      />
    );
  }
}

Field.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  validation: PropTypes.object,
};

Field.defaultProps = {
  label: '',
  validation: {},
};

export default Field;
