/* eslint-disable */
/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import classnames from 'classnames';
import { map, toPairs } from 'lodash';

const required = () =>
  value =>
    (value ? undefined : 'Required');
const maxLength = max =>
  value =>
    (value && value.length > max ? `Must be ${max} characters or less` : undefined);
const minLength = min =>
  value =>
    (value && value.length < min ? `Must be ${min} characters or more` : undefined);
const minValue = min =>
  value =>
    (value && value < min ? `Must be at least ${min} characters` : undefined);
const maxValue = max =>
  value =>
    (value && value > max ? `Must be less than ${max} characters` : undefined);

const validations = {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
};

const components = {
  text: (field) => (
    <div>
      <input type="text" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
  number: (field) => (
    <div>
      <input type="number" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
};

const getComponent = type => (
  Object.hasOwnProperty.call(components, type) ? components[type] : components['text']
);

const getValidation = validation => map(toPairs(validation), ([type, options]) => (
  Object.hasOwnProperty.call(validations, type) ? validations[type](options) : () => (`Validation "${type}" not found`)
));

/**
  * Renders a redux form field in the style of our app.
  * @extends Component
  */
class TextInput extends Component {
  render() {
    const component = getComponent(this.props.type);
    const validate = getValidation(this.props.validation);

    return (
      <ReduxFormField name={this.props.name} component={component} validate={validate} />
    );
  }
}

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default TextInput;
