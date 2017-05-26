import React from 'react';
import PropTypes from 'prop-types';

/**
  * Renders a set of pips indicating the current `Prompt`.
  */
const Pips = (props) => {
  const {
    count,
    currentIndex,
  } = props;

  const pips = [];

  for (let index = 0; index < count; index += 1) {
    const classes = (currentIndex === index ? 'pips__pip pips__pip--active' : 'pips__pip');
    pips.push(<div key={index} className={classes} />);
  }

  return (
    <div className="pips">
      <div className="pips__pips">
        { pips }
      </div>
    </div>
  );
};

Pips.propTypes = {
  count: PropTypes.number,
  currentIndex: PropTypes.number,
};

Pips.defaultProps = {
  count: 0,
  currentIndex: 0,
};

export default Pips;
