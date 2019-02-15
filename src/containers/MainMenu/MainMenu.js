import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { push } from 'react-router-redux';
import MainMenu from '../../components/MainMenu/MainMenu';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const mainMenuHandlers = withHandlers({
  handleReturnToStart: ({ closeMenu, endSession }) =>
    () => {
      closeMenu();
      endSession();
    },
  handleCloseMenu: ({ closeMenu }) => () => closeMenu(),
});

const mapStateToProps = state => ({
  sessionLoaded: state.activeProtocol.isLoaded,
  isOpen: state.ui.isMenuOpen,
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  mainMenuHandlers,
)(MainMenu);
