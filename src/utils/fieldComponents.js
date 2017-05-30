/* eslint-disable react/prop-types,react/no-multi-comp */

import React, { Component } from 'react';
import { fromPairs, map, reduce, sortBy, without } from 'lodash';

const CheckboxList = ({ name, options, onClickOption }) => (
  <div>
    {map(options, (value, option) => (
      <div key={option}>
        <label htmlFor={`${name}_${option}`}>
          <input
            type="checkbox"
            id={`${name}_${option}`}
            name={name}
            value={option}
            checked={value}
            onClick={() => { onClickOption(option); }}
          /> {option}
        </label>
      </div>
    ))}
  </div>
);

class CheckboxToggle extends Component {
  onClickOption = (clickedOption) => {
    const { value, onChange } = this.props.input;

    onChange({
      ...fromPairs(map(this.props.options, option => [option, false])),
      ...(value || {}),
      ...{ [clickedOption]: !value[clickedOption] },
    });
  }

  render() {
    const { meta, input: { name, value } } = this.props;

    return (
      <div>
        <CheckboxList name={name} options={value} onClickOption={this.onClickOption} />
        {meta.invalid &&
          <div>{meta.error}</div>}
      </div>
    );
  }
}

class CheckboxGroup extends Component {

  onClickOption = (option) => {
    const { value, onChange } = this.props.input;

    if (value.indexOf(option) === -1) {
      onChange(sortBy([...value, option]));
    } else {
      onChange(without(value, option));
    }
  }

  render() {
    const { options, meta, input: { name, value } } = this.props;

    const checks = reduce(
      options,
      (memo, option) => ({ ...memo, [option]: value.indexOf(option) !== -1 }),
      {},
    );

    return (
      <div>
        <CheckboxList name={name} options={checks} onClickOption={this.onClickOption} />
        {meta.invalid &&
          <div>{meta.error}</div>}
      </div>
    );
  }
}

// TODO: use components provided by network-canvas-ui
export default {
  text: field => (
    <div>
      <input type="text" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
  number: field => (
    <div>
      <input type="number" placeholder={field.label} {...field.input} />
      {field.meta.invalid &&
        <div>{field.meta.error}</div>}
    </div>
  ),
  checkbox_toggle: CheckboxToggle,
  checkbox_group: CheckboxGroup,
};
