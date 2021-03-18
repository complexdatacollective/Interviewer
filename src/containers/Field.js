import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, get, toPairs } from 'lodash';
import * as Fields from '@codaco/ui/lib/components/Fields';
import validations from '../utils/Validations';
import { FormComponent } from '../protocol-consts';

const ComponentTypeNotFound = (componentType) => () => (
  <div>
    Input component &quot;
    {componentType}
    &quot; not found.
  </div>
);

/*
  * Returns the named field compontent, if no matching one is found
  or else it just returns a text input
  * @param {object} field The properties handed down from the protocol form
  */
export const getInputComponent = (componentType = 'Text') => {
  const def = get(FormComponent, componentType);

  return get(
    Fields,
    def,
    ComponentTypeNotFound(componentType),
  );
};

/**
* Returns the named validation function, if no matching one is found it returns a validation
* which will always fail.
* @param {string} validation The name of the validation function to return.
  */
const getValidation = (validation) => map(
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
    this.component = getInputComponent(props.component);
    // Use validate if it exists, enabling custom validations. Otherwise
    // use our validation getter.
    this.validate = props.validate || getValidation(props.validation);
  }

  render() {
    const {
      label, name, validation, ...rest
    } = this.props;
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
  validate: PropTypes.array,
};

Field.defaultProps = {
  label: '',
  validation: {},
  validate: null,
};

export default Field;
