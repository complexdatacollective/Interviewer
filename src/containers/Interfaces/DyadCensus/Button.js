import React from 'react';
import PropTypes from 'prop-types';
import ToggleButton from '@codaco/ui/lib/components/Fields/ToggleButton';

const Button = ({
  onClick,
  children,
  selected,
}) => (
  <ToggleButton
    input={{
      onChange: onClick,
      value: selected,
    }}
    label={children}
  />
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

Button.defaultProps = {
  selected: false,
};

export default Button;
