import React from 'react';
import { map } from 'lodash';
import PropTypes from 'prop-types';

/**
  * A radio selector that allows a single choice from a list of options
  */
const RadioGroup = ({ options, label, meta, input: { name, value, onChange } }) => (
  <div className="radio-group">
    <div>{label}</div>

    <div>
      {map(options, option => (
        <div key={option}>
          <label htmlFor={`${name}_${option}`} className="radio-group__item" >
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

RadioGroup.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.string.isRequired,
  input: PropTypes.object.isRequired,
};

export default RadioGroup;
