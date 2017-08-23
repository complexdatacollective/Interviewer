/* eslint-disable jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Field as ReduxFormField } from 'redux-form';
import { map, toPairs } from 'lodash';
import validations from '../../utils/Validations';
import components from '../../components/Inputs/fieldComponents';
import { withOptionsFromSelector } from '../../behaviours';

/**
  * Returns the named field compontent, if no matching one is found it returns an empty one.
  * @param {string} type The name of the field component to return.
  */
const getComponent = type => (
  Object.hasOwnProperty.call(components, type) ?
  components[type] :
  () => (<div>Field type not defined</div>)
);

const InputWrapper = ({
  input,
  meta,
  label,
  options,
  children,
}) => {
  console.log('input', input);
  console.log('meta', meta);
  console.log('options', options);

  // const { options, label, meta, input: { name, value } } = this.props;

  const inputProps = {
    name: input.name,
    value: input.value,
    onRadioClick: input.onChange,
    label,
    meta,
    options,
  };

  return (
    <div className="input__container">
      {children(inputProps)}
    </div>
  );
};

InputWrapper.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object,
  options: PropTypes.array,
  label: PropTypes.string,
  children: PropTypes.node,
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
  let InputComponent = getComponent(type);
  console.log(InputComponent);
  if (optionsSelector) {
    InputComponent = withOptionsFromSelector(InputComponent, optionsSelector);
  }

  // component={props => (
  //       <InputWrapper {...props}>
  //         {wrappedProps =>
  //           <InputComponent {...wrappedProps} />
  //         }
  //       </InputWrapper>
  //     )}

  return (
    <ReduxFormField
      name={name}
      label={label}
      component={InputComponent}
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
