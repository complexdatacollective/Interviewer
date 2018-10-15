import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.OrdinalBin);

const TimelineStage = ({ item: { type, label, index }, handleOpenStage, currentStageIndex }) => {
  const classes = cx({
    'timeline-stage': true,
    'timeline-stage--current': currentStageIndex === index,
    'timeline-stage-past': currentStageIndex > index,
  });

  return (
    <div onClick={handleOpenStage} className={classes}>
      <div className="timeline-stage__notch" />
      <div className="timeline-stage__preview">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
        />
      </div>
      <div className="timeline-stage__label">{label}</div>
    </div>
  );
};

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  currentStageIndex: PropTypes.number.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default TimelineStage;
