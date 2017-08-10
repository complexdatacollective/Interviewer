import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextInput } from 'network-canvas-ui';

/**
  * Numeric field type
  */

class Numeric extends Component {
  handleKeyDown = (e) => {
    if (!(
      e.metaKey || // cmd/ctrl
      e.key in ['ArrowRight', 'ArrowLeft'] || // arrow keys
      e.which === 8 || // delete key
      /[0-9]/.test(String.fromCharCode(e.which)) // numbers
    )) {
      e.preventDefault();
    }
  }

  render() {
    const { input, label, meta } = this.props;

    return (
      <div>
        <TextInput
          label={label}
          placeholder={label}
          name={input.name}
          isNumericOnly
          errorText={
            meta.invalid && meta.dirty &&
            <div>{meta.error}</div>
          }
          onKeyDown={this.handleKeyDown}
          {...input}
        />
      </div>
    );
  }
}

Numeric.propTypes = {
  input: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.object.isRequired,
};

export default Numeric;
