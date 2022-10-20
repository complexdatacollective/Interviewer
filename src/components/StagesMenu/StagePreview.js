import React from 'react';
import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import timelineImages from '../../images/timeline';
import { currentStageIndex } from '../../utils/matchSessionPath';
import { get } from '../../utils/lodash-replacements';

const getTimelineImage = (type) => get(timelineImages, type, timelineImages.Default);

const StagePreview = ({
  item: {
    type, label, index, id,
  },
  handleOpenStage,
  active,
}) => {
  const classes = cx('stage-preview', {
    'stage-preview--current': active,
  });

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const timelineVariants = {
    expanded: {
      y: 0,
      opacity: 1,
      height: '100%',
      transition: {
        duration: baseAnimationDuration / 3,
      },
    },
    normal: {
      y: '-100%',
      opacity: 0,
      height: 0,
      transition: {
        duration: baseAnimationDuration / 3,
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
        className="stage-preview__notch"
        variants={timelineVariants}
        key={id}
      />
      <div className="stage-preview__image">
        <img
          src={getTimelineImage(type)}
          alt="NameGenerator Interface"
          title="NameGenerator Interface"
        />
      </div>
      <div className="stage-preview__label">
        {index + 1}
        .
        {' '}
        {label}
      </div>
    </div>
  );
};

const stagePreviewHandlers = withHandlers({
  handleOpenStage: (props) => () => {
    const {
      item: { index: stageIndex },
      onStageSelect,
      setExpanded,
    } = props;

    onStageSelect(stageIndex);
    setExpanded(false);
  },
});

const mapStateToProps = (state) => ({
  currentStageIndex: currentStageIndex(state.router.location.pathname),
});

StagePreview.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
};

export default compose(
  connect(mapStateToProps),
  stagePreviewHandlers,
)(StagePreview);
