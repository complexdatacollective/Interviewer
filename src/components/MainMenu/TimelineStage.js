import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.OrdinalBin);

const TimelineStage = ({ item: { type, label }, handleOpenStage }) => (
  <div onClick={handleOpenStage} className="timeline-stage">
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

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default TimelineStage;
