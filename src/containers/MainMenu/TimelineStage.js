import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import TimelineStage from '../../components/MainMenu/TimelineStage';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { currentStageIndex } from '../../utils/matchSessionPath';

const timelineStageHandlers = withHandlers({
  handleOpenStage: props =>
    () => {
      const {
        sessionId,
        item: { index: stageIndex },
        openStage,
      } = props;

      const path = sessionId ? `/session/${sessionId}/${stageIndex}` : '/';
      openStage(path);
    },
});

const mapStateToProps = state => ({
  currentStageIndex: currentStageIndex(state.router.location.pathname),
  sessionId: state.activeSessionId,
});

const mapDispatchToProps = dispatch => ({
  openStage: (path) => {
    dispatch(push(path));
    dispatch(uiActions.update({ isMenuOpen: false }));
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  timelineStageHandlers,
)(TimelineStage);
