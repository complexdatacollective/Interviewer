import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import { isStageSkipped } from '../../../selectors/skip-logic';
import TimelineStage from '../../../components/MainMenu/TimelineStage';
import { actionCreators as uiActions } from '../../../ducks/modules/ui';
import { actionCreators as dialogActions } from '../../../ducks/modules/dialogs';
import { currentStageIndex } from '../../../utils/matchSessionPath';

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

      const path = sessionId ? `/session/${sessionId}/${stageIndex}` : '/';

      if (isSkipped(stageIndex)) {
        openDialog({
          type: 'Warning',
          title: 'Show this stage?',
          confirmLabel: 'Show Stage',
          onConfirm: () => openStage(path),
          message: (
            <p>
              Your skip logic settings would normally prevent this stage from being shown in this
              interview. Do you want to show it anyway?
            </p>
          ),
        });
      } else {
        openStage(path);
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
    dispatch(uiActions.update({ isMenuOpen: false }));
  },
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  timelineStageHandlers,
)(TimelineStage);
