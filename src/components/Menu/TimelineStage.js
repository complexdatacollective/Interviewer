import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.OrdinalBin);

const TimelineStage = props => (
  <div className="timeline-stage">
    <div className="timeline-stage__notch" />
    <div className="timeline-stage__preview">
      <img
        src={getTimelineImage(props.item.type)}
        alt="NameGenerator Interface"
        title="NameGenerator Interface"
      />
    </div>
    <div className="timeline-stage__label">{props.item.label}</div>
  </div>
);

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
};

export default TimelineStage;
