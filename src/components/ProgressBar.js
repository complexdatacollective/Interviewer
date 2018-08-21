import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ percentProgress }) =>
  (
    <div className="progress-bar">
      <div className="progress-bar__filler" style={{ height: `${percentProgress}%` }} />
    </div>
  );

ProgressBar.propTypes = {
  percentProgress: PropTypes.number,
};

ProgressBar.defaultProps = {
  percentProgress: 0,
};

export default ProgressBar;
