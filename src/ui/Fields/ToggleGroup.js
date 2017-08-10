import React from 'react';
import { map, zip } from 'lodash';
import { ContextInput } from 'network-canvas-ui';

import CheckboxGroup from './CheckboxGroup';

const isChecked = (value, option) => (value ? !!value[option] : false);

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
            <ContextInput
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

export default ToggleGroup;
