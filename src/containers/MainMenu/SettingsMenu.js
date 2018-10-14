import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import SettingsMenu from '../../components/MainMenu/SettingsMenu';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as mockActions } from '../../ducks/modules/mock';
import { actionCreators as dialogsActions } from '../../ducks/modules/dialogs';

const settingsMenuHandlers = withHandlers({
  handleResetAppData: props => () => {
    props.openDialog({
      type: 'Warning',
      title: 'Reset application data?',
      message: 'This will delete ALL data from Network Canvas, including interview data and settings. Do you wish to continue?',
      onConfirm: () => {
        props.resetState();
        props.closeMenu();
      },
      confirmLabel: 'Continue',
    });
  },
  handleAddMockNodes: props => () => {
    props.generateNodes(20);
    props.closeMenu();
  },
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  openDialog: bindActionCreators(dialogsActions.openDialog, dispatch),
  resetState: () => dispatch(push('/reset')),
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
});

export default compose(
  connect(null, mapDispatchToProps),
  settingsMenuHandlers,
)(SettingsMenu);

