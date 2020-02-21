import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import cx from 'classnames';

const fillerValue = (orientation, percentProgress) => {
  const property = orientation === 'horizontal' ? 'width' : 'height';

  return {
    [property]: `${percentProgress}%`,
  };
};


const spring = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
};

const ProgressBar = ({ percentProgress, onClick, orientation }) =>
  (
    <motion.div
      positionTransition={spring}
      className={cx(
        'progress-bar',
        `progress-bar progress-bar--${orientation}`,
        { 'progress-bar--complete': percentProgress === 100 },
      )}
      onClick={onClick}
    >
      <div className="progress-bar__filler" style={fillerValue(orientation, percentProgress)} />
    </motion.div>
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
