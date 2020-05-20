import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

const Button = ({
  onClick,
  children,
  selected,
}) => {
  const classes = cx(
    'dyad-interface__button',
    {
      'dyad-interface__button--selected': selected,
    },
  );

  return (
    <div
      className={classes}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

Button.defaultProps = {
  selected: false,
};

export default Button;
