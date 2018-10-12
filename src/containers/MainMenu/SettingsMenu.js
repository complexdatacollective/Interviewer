import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import SettingsMenu from '../../components/MainMenu/SettingsMenu';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as mockActions } from '../../ducks/modules/mock';

const settingsMenuHandlers = withHandlers({
  handleResetAppData: props => () => {
    props.resetState();
    props.closeMenu();
  },
  handleAddMockNodes: props => () => {
    props.generateNodes(20);
    props.closeMenu();
  },
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  resetState: () => dispatch(push('/reset')),
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
});

export default compose(
  connect(null, mapDispatchToProps),
  settingsMenuHandlers,
)(SettingsMenu);

