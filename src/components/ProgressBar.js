import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ percentProgress, onClick }) =>
  (
    <div className="progress-bar" onClick={onClick}>
      <div className="progress-bar__filler" style={{ height: `${percentProgress}%` }} />
    </div>
  );

ProgressBar.propTypes = {
  percentProgress: PropTypes.number,
  onClick: PropTypes.func,
};

ProgressBar.defaultProps = {
  percentProgress: 0,
  onClick: () => {},
};

export default ProgressBar;
