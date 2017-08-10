import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map } from 'lodash';

import { ContextInput } from 'network-canvas-ui';

const isChecked = (value, option) => (value ? !!value[option] : false);

/**
  * A checkbox list that sets thes field value to a key/value object of boolean properties
  */
class CheckboxGroup extends Component {
  onClickOption = (clickedOption) => {
    const { input: { value, onChange } } = this.props;
    const nextValue = value[clickedOption] ? !value[clickedOption] : true;

    onChange({
      ...fromPairs(map(this.props.options, option => [option, false])),
      ...(value || {}),
      ...{ [clickedOption]: nextValue },
    });
  }

  render() {
    const { options, label, meta, input: { name, value } } = this.props;

    return (
      <div>
        <div>{label}</div>
        {map(options, option => (
          <ContextInput
            name={name}
            label={option}
            onCheck={() => this.onClickOption(option)}
            checked={isChecked(value, option)}
          />
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
