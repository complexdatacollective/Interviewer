import React from 'react';
import PropTypes from 'prop-types';

const fillerValue = (orientation, percentProgress) => {
  const property = orientation === 'horizontal' ? 'width' : 'height';

  return {
    [property]: `${percentProgress}%`,
  };
};

const ProgressBar = ({ percentProgress, onClick, orientation }) =>
  (
    <div className={`progress-bar progress-bar--${orientation}`} onClick={onClick}>
      <div className="progress-bar__filler" style={fillerValue(orientation, percentProgress)} />
    </div>
  );

ProgressBar.propTypes = {
  percentProgress: PropTypes.number,
  onClick: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

ProgressBar.defaultProps = {
  percentProgress: 0,
  onClick: () => {},
  orientation: 'vertical',
};

export default ProgressBar;
