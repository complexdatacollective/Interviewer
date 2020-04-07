import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { get } from 'lodash';
import { motion } from 'framer-motion';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { isStageSkipped } from '../../selectors/skip-logic';
import timelineImages from '../../images/timeline';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { currentStageIndex } from '../../utils/matchSessionPath';

const getTimelineImage = type =>
  get(timelineImages, type, timelineImages.Default);

const StagePreview = ({
  item: { type, label, index, id },
  handleOpenStage,
  onImageLoaded,
  active,
}) => {
  const classes = cx('menu-timeline-stage', {
    'menu-timeline-stage--current': active,
  });

  const baseAnimationDuration = getCSSVariableAsNumber('--animation-duration-standard-ms') / 1000;

  const timelineVariants = {
    expanded: {
      // scaleY: 1,
      y: 0,
      opacity: 1,
      height: 'auto',
      transition: {
        // delay: 0.1 + 0.15,
        duration: baseAnimationDuration / 3,
      },
    },
    normal: {
      // scaleY: 0.05,
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

const stagePreviewHandlers = withHandlers({
  handleOpenStage: props =>
    () => {
      const {
        sessionId,
        item: { index: stageIndex },
        openStage,
        isSkipped,
        openDialog,
      } = props;

      const performOpen = () => {
        const path = sessionId ? `/session/${sessionId}/${stageIndex}` : '/';
        openStage(path);
        props.setExpanded(false);
      };

      if (isSkipped(stageIndex)) {
        openDialog({
          type: 'Warning',
          title: 'Show this stage?',
          confirmLabel: 'Show Stage',
          onConfirm: () => performOpen(),
          message: (
            <p>
              Your skip logic settings would normally prevent this stage from being shown in this
              interview. Do you want to show it anyway?
            </p>
          ),
        });
      } else {
        performOpen();
      }
    },
});

const mapStateToProps = state => ({
  currentStageIndex: currentStageIndex(state.router.location.pathname),
  sessionId: state.activeSessionId,
  isSkipped: index => isStageSkipped(index)(state),
});

const mapDispatchToProps = dispatch => ({
  openStage: (path) => {
    dispatch(push(path));
  },
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

StagePreview.propTypes = {
  item: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  handleOpenStage: PropTypes.func.isRequired,
  onImageLoaded: PropTypes.func.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  stagePreviewHandlers,
)(StagePreview);

