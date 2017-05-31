/* eslint-disable */
/* This is a shim until we have a full suite of UI elements in network-canvas-ui */
import React, { Component } from 'react';
import { map } from 'lodash';
import { Alphanumeric, Numeric, CheckboxGroup, CheckboxList, ToggleGroup } from 'network-canvas-ui/lib/components/Field'

/**
  * A radio selector that allows a single choice from a list of options
  */
class RadioGroup extends Component {
  render() {
    const { options, label, meta, input: { name, value, onChange } } = this.props;

    return (
      <div className="radio-group">
        <div>{label}</div>

        <div>
          {map(options, option => (
            <div key={option}>
              <label htmlFor={`${name}_${option}`} className={`radio-group__item`} >
                <input
                  type="radio"
                  id={`${name}_${option}`}
                  name={name}
                  value={option}
                  checked={value === option}
                  onClick={() => { onChange(option); }}
                /> {option}
              </label>
            </div>
          ))}
        </div>
        {meta.invalid &&
          <div>{meta.error}</div>}
      </div>
    );
  }
}

// TODO: use components provided by network-canvas-ui
export default {
  Alphanumeric,
  Numeric,
  CheckboxGroup,
  CheckboxList,
  ToggleGroup,
  RadioGroup
};
