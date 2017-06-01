import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map } from 'lodash';

/**
  * A checkbox list that sets thes field value to a key/value object of boolean properties
  */
class CheckboxGroup extends Component {
  onClickOption = (clickedOption) => {
    const { input: { value, onChange } } = this.props;

    onChange({
      ...fromPairs(map(this.props.options, option => [option, false])),
      ...(value || {}),
      ...{ [clickedOption]: !value[clickedOption] },
    });
  }

  render() {
    const { options, label, meta, input: { name, value } } = this.props;

    return (
      <div>
        <div>{label}</div>
        {map(options, option => (
          <div key={option}>
            <label htmlFor={`${name}_${option}`}>
              <input
                type="checkbox"
                id={`${name}_${option}`}
                name={name}
                value={option}
                checked={!!value[option]}
                onChange={() => { this.onClickOption(option); }}
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

CheckboxGroup.propTypes = {
  input: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
};

export default CheckboxGroup;
