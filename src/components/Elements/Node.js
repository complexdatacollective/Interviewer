import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
  * Renders a Node.
  */
const Node = (props) => {
  const {
    label,
    isActive,
  } = props;

  const classes = classNames('node', { 'node--is-active': isActive });

  return (
    <div className={classes} >
      <div className="node__label">{label}</div>
    </div>
  );
};

Node.propTypes = {
  label: PropTypes.string,
  isActive: PropTypes.bool,
};

Node.defaultProps = {
  label: 'Node',
  isActive: false,
};

export default Node;
