import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withHandlers, compose } from 'recompose';
import SettingsMenu from '../../components/MainMenu/SettingsMenu';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as mockActions } from '../../ducks/modules/mock';
import { actionCreators as dialogsActions } from '../../ducks/modules/dialogs';
import { actionCreators as deviceSettingsActions } from '../../ducks/modules/deviceSettings';

const personEntry = (protocol) => {
  const registry = protocol && protocol.variableRegistry;
  const entry = registry && registry.node && Object.entries(registry.node).find(([, nodeType]) => nodeType.name === 'person');
  if (!entry || entry.length !== 2) {
    return null;
  }
  return entry;
};

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
    const entry = personEntry(props.protocol);
    if (!entry) {
      return;
    }
    const [typeKey, personDefinition] = entry;
    props.generateNodes(personDefinition.variables, typeKey, 20);
    props.closeMenu();
  },
});

const mapDispatchToProps = dispatch => ({
  closeMenu: () => dispatch(uiActions.update({ isMenuOpen: false })),
  openDialog: bindActionCreators(dialogsActions.openDialog, dispatch),
  resetState: () => dispatch(push('/reset')),
  generateNodes: bindActionCreators(mockActions.generateNodes, dispatch),
  setDeviceDescription: name => dispatch(deviceSettingsActions.setDescription(name)),
  toggleUseFullScreenForms: () => dispatch(deviceSettingsActions.toggleSetting('useFullScreenForms')),
  toggleUseDynamicScaling: () => dispatch(deviceSettingsActions.toggleSetting('useDynamicScaling')),
  setInterfaceScale: scale => dispatch(deviceSettingsActions.setInterfaceScale(scale)),
});

const mapStateToProps = state => ({
  protocol: state.protocol,
  shouldShowMocksItem: !!personEntry(state.protocol),
  useFullScreenForms: state.deviceSettings.useFullScreenForms,
  useDynamicScaling: state.deviceSettings.useDynamicScaling,
  deviceDescription: state.deviceSettings.description,
  interfaceScale: state.deviceSettings.interfaceScale,
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  settingsMenuHandlers,
)(SettingsMenu);

