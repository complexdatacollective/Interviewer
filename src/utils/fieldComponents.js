/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { map, sortBy, without } from 'lodash';

class Checkbox extends Component {

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

    return (
      <div>
        {map(options, option => (
          <div key={option}>
            <label htmlFor={`${name}_${option}`}>
              <input
                type="checkbox"
                id={`${name}_${option}`}
                name={name}
                value={option}
                checked={value.indexOf(option) !== -1}
                onClick={() => { this.onClickOption(option); }}
              /> {option}
            </label>
          </div>
        ))}
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
  checkbox: Checkbox,
};
