import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CharInput from './CharInput';

const onKeyUp = (evt) => {
  if (evt.key === 'Backspace') {
    const input = evt.currentTarget.querySelector('input:focus');
    CharInput.focusPrevious(input);
  }
};

class PairingCodeInput extends Component {
  constructor(props) {
    super(props);

    this.emptyChars = new Array(props.charCount);
    this.emptyChars.fill('');
    Object.freeze(this.emptyChars);

    this.state = { characters: this.emptyChars };
  }

  onChange = (evt) => {
    const { charCount } = this.props;
    const { characters } = this.state;
    const target = evt.currentTarget;
    const index = parseInt(target.getAttribute('data-index'), 10);
    let { value } = target;
    let newCharacters;

    if (value.length === charCount) {
      // Handle paste of entire code
      newCharacters = value.split('');
      target.blur();
    } else {
      // TODO: this takes the last form input, which may not be the last typed.
      value = value[value.length - 1] || '';
      newCharacters = characters.slice();
      newCharacters.splice(index, 1, value);

      if (value) {
        CharInput.focusNext(target);
      }
    }
    this.updateCharacters(newCharacters);
  }

  clearForm() {
    this.updateCharacters(this.emptyChars);
  }

  updateCharacters(newCharacters) {
    const { setPairingCode } = this.props;
    this.setState({ characters: newCharacters }, () => (
      setPairingCode(newCharacters.join(''))
    ));
  }

  render() {
    const { disabled } = this.props;
    const { characters } = this.state;
    return (
      <div onKeyUp={onKeyUp} className="pairing-code-input">
        <div className="pairing-code-input__characters">
          {
            characters.map((char, i) => (
              <CharInput
                index={i}
                key={i}
                disabled={disabled}
                value={char}
                onChange={this.onChange}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

PairingCodeInput.defaultProps = {
  disabled: false,
};

PairingCodeInput.propTypes = {
  charCount: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  setPairingCode: PropTypes.func.isRequired,
};

export default PairingCodeInput;
