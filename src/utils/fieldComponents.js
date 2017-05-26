/* eslint-disable */

import React, { Component } from 'react';
import { map } from 'lodash';

// <div>
  // <input type="number" placeholder={field.label} {...field.input} />

class Checkbox extends Component {
  render() {
    const { options, meta, input: { name, value, onChange } } = this.props;
    console.log(this.props);
    return (
      <div>
        {map(options, option => (
          <div><input type="checkbox" name={name} value={option}/> {option}</div>
        ))}
        <span>The current value is {value}.</span>
        <button type="button" onClick={() => onChange(value + 1)}>Inc</button>
        <button type="button" onClick={() => onChange(value - 1)}>Dec</button>
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
