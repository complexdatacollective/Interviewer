import { connect } from 'react-redux';
import { withHandlers, compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import MainMenu from '../../components/MainMenu/MainMenu';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';

const mainMenuHandlers = withHandlers({
  handleReturnToStart: ({ closeMenu, endSession }) =>
    () => {
      closeMenu();
      endSession();
    },
  handleCloseMenu: ({ closeMenu }) => () => closeMenu(),
});

const mapStateToProps = state => ({
  sessionLoaded: !!state.activeSessionId,
  isOpen: state.ui.isMenuOpen,
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  endSession: () => {
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  mainMenuHandlers,
)(MainMenu);
