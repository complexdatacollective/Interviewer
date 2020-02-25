import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import timelineImages from '../../images/timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.Default);

const TimelineStage = ({
  item: { type, label, index, id },
  handleOpenStage,
  active,
}) => {
  const classes = cx('menu-timeline-stage', {
    'menu-timeline-stage--current': active,
  });
  console.log(type, label, index, id);
  return (
    <div
      onClick={handleOpenStage}
      className={classes}
      data-stage-name={id}
      data-stage-id={index}
    >
      <div className="menu-timeline-stage__preview">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
        />
      </div>
      <div className="menu-timeline-stage__label">{index + 1}. {label}</div>
    </div>
  );
};

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default TimelineStage;
