import React from 'react';
import { map, zip } from 'lodash';
import CheckboxGroup from './CheckboxGroup';

/**
  * A togglable list that sets thes field value to a key/value object of boolean properties
  */
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
            <div key={option}>
              <label htmlFor={`${name}_${option}`} className={`toggle-group__item toggle-group__item--palette-${color}`} >
                <input
                  type="checkbox"
                  id={`${name}_${option}`}
                  name={name}
                  value={option}
                  checked={value[option]}
                  onClick={() => { this.onClickOption(option); }}
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

export default ToggleGroup;
