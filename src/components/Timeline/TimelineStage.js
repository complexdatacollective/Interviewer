import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
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

  return (
    <motion.div
      onClick={handleOpenStage}
      className={classes}
      data-stage-name={id}
      data-stage-id={index}
      initial={{ scale: 0.95 }}
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 0.90 }}
    >
      <div className="menu-timeline-stage__preview">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
        />
      </div>
      <div className="menu-timeline-stage__label">{index + 1}. {label}</div>
    </motion.div>
  );
};

TimelineStage.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default TimelineStage;
