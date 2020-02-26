import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import { isStageSkipped } from '../../selectors/skip-logic';
import TimelineStage from '../../components/Timeline/TimelineStage';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { currentStageIndex } from '../../utils/matchSessionPath';

const timelineStageHandlers = withHandlers({
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
        props.toggleExpanded(false);
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  timelineStageHandlers,
)(TimelineStage);
