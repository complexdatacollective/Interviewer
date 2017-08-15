/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fromPairs, map } from 'lodash';
import { Alphanumeric, Numeric, ToggleGroup, RadioGroup } from '../ui/Fields';

import { ContextInput } from 'network-canvas-ui';

// import { TextInput as Alphanumeric } from 'network-canvas-ui';

// class Numeric extends Component {
//   handleKeyDown = (e) => {
//     if (!(
//       e.metaKey || // cmd/ctrl
//       e.key in ['ArrowRight', 'ArrowLeft'] || // arrow keys
//       e.which === 8 || // delete key
//       /[0-9]/.test(String.fromCharCode(e.which)) // numbers
//     )) {
//       e.preventDefault();
//     }
//   }

//   render() {
//     const { input, label, meta } = this.props;

//     return (
//       <TextInput
//         label={label}
//         placeholder={label}
//         name={input.name}
//         isNumericOnly
//         errorText={
//           meta.invalid && meta.dirty &&
//           <div>{meta.error}</div>
//         }
//         onKeyDown={this.handleKeyDown}
//         {...input}
//       />
//     );
//   }
// }

// Numeric.propTypes = {
//   input: PropTypes.object.isRequired,
//   label: PropTypes.string.isRequired,
//   meta: PropTypes.object.isRequired,
// };

const CheckboxGroup = (field) => {
  return (
    <div>
      <div>{field.label}</div>
      {map(field.options, option => (
        <ContextInput
          key={option}
          name={field.input.name}
          label={option}
        />
      ))}
      {field.input.meta.invalid &&
        <div>{field.input.meta.error}</div>}
    </div>
  );
}

// TODO: use components provided by network-canvas-ui
export default {
  Alphanumeric,
  Numeric,
  CheckboxGroup,
  ToggleGroup,
  RadioGroup
};
