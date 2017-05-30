/* eslint-disable */

import React, { Component } from 'react';
import { map, reduce, tap, join, filter} from 'lodash';

// <div>
  // <input type="number" placeholder={field.label} {...field.input} />

class Checkbox extends Component {
  constructor(props) {
    super();

    this.state = reduce(
      props.options,
      (memo, option) => tap(
        memo,
        (memo) => { memo[option] = false; }
      ),
      {},
    );
  }

  onClickOption = (option) => {
    this.setState(
      {[option]: !this.state[option]},
      () => { this.props.input.onChange(this.value()) }
    );
  }

  value() {
    return filter(
        map(
          this.state,
          (value, key) => (value ? key : null),
        ),
        value => !!value,
      );
  }

  render() {
    const { options, meta, input: { name, value, onChange } } = this.props;

    return (
      <div>
        {map(options, option => (
          <div key={option}><label><input type="checkbox" name={name} value={option} checked={this.state[option]} onClick={() => { this.onClickOption(option) }} /> {option}</label></div>
        ))}
        <span>The current value is {value.length}.</span>
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
