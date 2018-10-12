import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import SettingsMenu from '../../components/MainMenu/SettingsMenu';
import { actionCreators as mockActions } from '../../ducks/modules/mock';

const settingsMenuHandlers = withHandlers({
  handleResetAppData: props => () => props.resetState(),
  handleAddMockNodes: props => () => {
    props.generateNodes(20);
  },
});

const mapDispatchToProps = dispatch => ({
  resetState: () => dispatch(push('/reset')),
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
});

export default compose(
  connect(null, mapDispatchToProps),
  settingsMenuHandlers,
)(SettingsMenu);

