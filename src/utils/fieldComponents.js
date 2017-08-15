/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map, zip } from 'lodash';

import {
  TextInput as Alphanumeric,
  ContextInput,
  Checkbox,
  RadioGroup as NCRadioGroup,
  RadioInput
} from 'network-canvas-ui';

const isChecked = (value, option) => (value ? !!value[option] : false);

class Numeric extends Component {
  handleKeyDown = (e) => {
    if (!(
      e.metaKey || // cmd/ctrl
      e.key in ['ArrowRight', 'ArrowLeft'] || // arrow keys
      e.which === 8 || // delete key
      /[0-9]/.test(String.fromCharCode(e.which)) // numbers
    )) {
      e.preventDefault();
    }
  }

  render() {
    const { input, label, meta } = this.props;

    return (
      <Alphanumeric
        label={label}
        placeholder={label}
        name={input.name}
        isNumericOnly
        errorText={
          meta.invalid && meta.dirty &&
          <div>{meta.error}</div>
        }
        onKeyDown={this.handleKeyDown}
        {...input}
      />
    );
  }
}

Numeric.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
};

class CheckboxGroup extends Component {
  onClickOption = (clickedOption) => {
    const { input: { value, onChange } } = this.props;
    const nextValue = value[clickedOption] ? !value[clickedOption] : true;

    onChange({
      ...fromPairs(map(this.props.options, option => [option, false])),
      ...(value || {}),
      ...{ [clickedOption]: nextValue },
    });
  }

  render() {
    const { options, label, meta, input: { name, value } } = this.props;

    return (
      <div>
        <div>{label}</div>
        {map(options, option => (
          <Checkbox
            key={option}
            name={name}
            label={option}
            onCheck={() => this.onClickOption(option)}
            checked={isChecked(value, option)}
          />
        ))}
        {meta.invalid &&
          <div>{meta.error}</div>}
      </div>
    );
  }
}

CheckboxGroup.propTypes = {
  input: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
};

class ToggleGroup extends CheckboxGroup {
  render() {
    const { options, colors, label, meta, input: { name, value } } = this.props;

    const optionsWithColor = (
      colors ? zip(options, colors) : map(options, (option, index) => [option, index])
    );

    return (
      <div>
        <div>{label}</div>
        <div>
          {map(optionsWithColor, ([option, color]) => (
            <ContextInput
              key={option}
              name={name}
              label={option}
              color={color}
              onCheck={() => this.onClickOption(option)}
              checked={isChecked(value, option)}
            />
          ))}
        </div>
        {meta.invalid &&
          <div>{meta.error}</div>}
      </div>
    );
  }
}

/**
  * A radio selector that allows a single choice from a list of options
  */
class RadioGroup extends Component {
  render() {
    const { options, label, meta, input: { name, value, onChange } } = this.props;

    return (
      <div className="radio-group">
        <div>{label}</div>
        <NCRadioGroup
          name={name}
          value={value}
          onRadioClick={onChange}
          errorText={
            meta.invalid &&
            <div>{meta.error}</div>
          }
        >
          {map(options, option => (
            <RadioInput
              key={option}
              label={option}
              value={option}
            />
          ))}
        </NCRadioGroup>
      </div>
    );
  }
}

RadioGroup.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  input: PropTypes.object.isRequired,
};

export default {
  Alphanumeric,
  Numeric,
  CheckboxGroup,
  ToggleGroup,
  RadioGroup
};
