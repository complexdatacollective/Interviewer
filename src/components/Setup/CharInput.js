import React from 'react';
import PropTypes from 'prop-types';

// TODO: Share with Server
const charSet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const CharInput = ({ value, disabled, index, onChange }) => {
  let className = 'pairing-code-input__character';
  if (value && !charSet.includes(value)) {
    className += ' pairing-code-input__character--error';
  }
  return (
    <React.Fragment>
      <label className="offscreen" htmlFor={`pairing-code-character-${index}`}>
        Pairing code character {index}
      </label>
      <input
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className={className}
        data-index={index}
        disabled={disabled}
        id={`pairing-code-character-${index}`}
        onChange={onChange}
        onFocus={evt => evt.target.select()}
        type="text"
        value={value}
      />
    </React.Fragment>
  );
};

CharInput.focusNext = (currentInput) => {
  const nextLabel = currentInput.nextElementSibling;
  if (nextLabel && nextLabel.focus) {
    nextLabel.focus();
  }
};

CharInput.focusPrevious = (currentInput) => {
  const prevLabel = currentInput.previousElementSibling;
  const prevInput = prevLabel && prevLabel.previousElementSibling;
  if (prevInput && prevInput.focus) {
    prevInput.focus();
  }
};

CharInput.defaultProps = {
  disabled: false,
};

CharInput.propTypes = {
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CharInput;
