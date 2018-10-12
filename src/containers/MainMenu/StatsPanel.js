import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { compose, withHandlers } from 'recompose';
import StatsPanel from '../../components/MainMenu/StatsPanel';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const statsPanelHandlers = withHandlers({
  onFinishInterview: ({ closeMenu, endSession }) =>
    () => {
      closeMenu();
      endSession();
    },
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
});

export default compose(
  connect(null, mapDispatchToProps),
  statsPanelHandlers,
)(StatsPanel);
