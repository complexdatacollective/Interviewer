import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '../ui/components';
import { ProgressBar } from '../components';

const Timeline = ({ onClickBack, onClickNext, percentProgress }) => (
  <div className="timeline">
    <div className="timeline-nav timeline-nav--back">
      <Icon onClick={onClickBack} name="chevron-up" />
    </div>
    <ProgressBar percentProgress={percentProgress} />
    <div className="timeline-nav timeline-nav--next" onClick={onClickNext} >
      <Icon name="chevron-down" />
    </div>
  </div>
);

Timeline.propTypes = {
  onClickBack: PropTypes.func,
  onClickNext: PropTypes.func,
  percentProgress: PropTypes.number,
};

Timeline.defaultProps = {
  onClickBack: () => {},
  onClickNext: () => {},
  percentProgress: 0,
};

export default Timeline;
