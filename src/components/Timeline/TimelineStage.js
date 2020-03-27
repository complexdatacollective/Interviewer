import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import { motion } from 'framer-motion';
import timelineImages from '../../images/timeline';
import { baseAnimationDuration } from '../../components/Timeline/Timeline';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.Default);

const TimelineStage = ({
  item: { type, label, index, id },
  handleOpenStage,
  onImageLoaded,
  active,
}) => {
  const classes = cx('menu-timeline-stage', {
    'menu-timeline-stage--current': active,
  });

  const timelineVariants = {
    expanded: {
      // scaleY: 1,
      y: 0,
      opacity: 1,
      height: 'auto',
      transition: {
        // delay: 0.1 + 0.15,
        duration: 0.25,
      },
    },
    normal: {
      // scaleY: 0.05,
      y: '-100%',
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.25,
      },
    },
  };

  return (
    <div
      onClick={handleOpenStage}
      className={classes}
      data-stage-name={id}
      data-stage-id={index}
    >
      <motion.div
        className="menu-timeline-stage-notch"
        variants={timelineVariants}
        key={id}
      />
      <div className="menu-timeline-stage__preview">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
          onLoad={onImageLoaded}
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
  onImageLoaded: PropTypes.func.isRequired,
};

export default TimelineStage;
