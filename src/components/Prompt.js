import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

/**
  * Renders a single prompt.
  */
const Prompt = (props) => {
  const {
    label,
    isActive,
    isLeaving,
  } = props;

  const classNames = cx(
    'prompts__prompt',
    { 'prompts__prompt--active': isActive },
    { 'prompts__prompt--leaving': isLeaving }, // TODO: rename class
  );

  return (
    <div className={classNames}>
      <h1 className="prompts__prompt-header">{label}</h1>
    </div>
  );
};

Prompt.propTypes = {
  label: PropTypes.string,
  isActive: PropTypes.bool,
  isLeaving: PropTypes.bool,
};

Prompt.defaultProps = {
  label: '',
  isActive: false,
  isLeaving: false,
};

export default Prompt;
