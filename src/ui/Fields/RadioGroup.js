import React from 'react';
import { map } from 'lodash';
import PropTypes from 'prop-types';

import { RadioGroup as NCRadioGroup, RadioInput } from 'network-canvas-ui';

/**
  * A radio selector that allows a single choice from a list of options
  */
const RadioGroup = ({ options, label, meta, input: { name, value, onChange } }) => (
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

RadioGroup.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
  input: PropTypes.object.isRequired,
};

export default RadioGroup;
