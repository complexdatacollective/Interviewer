import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.Default);

const TimelineStage = ({ item: { type, label, index, id }, handleOpenStage, currentStageIndex }) => {
  const classes = cx({
    'main-menu-timeline-stage': true,
    'main-menu-timeline-stage--current': currentStageIndex === index,
    'main-menu-timeline-stage-past': currentStageIndex > index,
  });

  return (
    <div 
      onClick={handleOpenStage}
      className={classes}
      data-stage-id={id}
    >
      <div className="main-menu-timeline-stage__notch" />
      <div className="main-menu-timeline-stage__preview">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
        />
      </div>
      <div className="main-menu-timeline-stage__label">{index + 1}. {label}</div>
    </div>
  );
};

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  currentStageIndex: PropTypes.number.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default TimelineStage;
