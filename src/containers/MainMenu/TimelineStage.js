import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import TimelineStage from '../../components/MainMenu/TimelineStage';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { matchSessionPath } from '../../utils/matchSessionPath';

const timelineStageHandlers = withHandlers({
  handleOpenStage: props =>
    () => {
      const {
        protocolPath,
        sessionId,
        protocolType,
        index: stageIndex,
        openStage,
      } = props;

      const path = protocolPath ? `/session/${sessionId}/${protocolType}/${protocolPath}/${stageIndex}` : '/';

      openStage(path);
    },
});

const mapStateToProps = (state) => {
  const currentStageIndex = (path) => {
    const matchedPath = matchSessionPath(path);
    if (matchedPath) {
      return parseInt(matchedPath.params.stageIndex, 10);
    }
    return 0;
  };

  return ({
    protocolPath: state.protocol.path,
    currentStageIndex: currentStageIndex(state.router.location.pathname),
    protocolType: state.protocol.type,
    sessionId: state.session,
  });
};

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
