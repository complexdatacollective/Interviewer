import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import TimelineStage from '../../components/MainMenu/TimelineStage';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

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

const mapStateToProps = state => ({
  protocolPath: state.protocol.path,
  protocolType: state.protocol.type,
  sessionId: state.session,
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
