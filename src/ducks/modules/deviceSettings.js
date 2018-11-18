/* globals device */
import deviceDescription from '../../utils/DeviceInfo';
import { isCordova } from '../../utils/Environment';

const SET_DESCRIPTION = 'SETTINGS/SET_DESCRIPTION';
const SET_INTERFACE_SCALE = 'SETTINGS/SET_INTERFACE_SCALE';
const TOGGLE_SETTING = 'SETTINGS/TOGGLE_SETTING';
const DEVICE_READY = 'DEVICE_READY';

// getDeviceReadyState() may provide better defaults once more is known about the device.
// Static defaults should be distinguishable from user choices (e.g., undefined instead of false).
const initialState = {
  description: 'Unknown device',
  useDynamicScaling: undefined,
  // useFullScrenForms should be false for most larger devices, and true for most tablets
  useFullScreenForms: !(window.matchMedia('screen and (min-device-aspect-ratio: 8/5), (min-device-height: 1800px)').matches),
  interfaceScale: 100,
};

// This provides additional default state based on information unavailable before 'deviceready'.
// Rehydration may occur before this, so only overwrite static default values.
const getDeviceReadyState = (state) => {
  let description = state.description;
  let useDynamicScaling = state.useDynamicScaling;
  if (description === initialState.description) {
    description = deviceDescription();
  }
  if (useDynamicScaling === initialState.useDynamicScaling) {
    // Disable dynamic scaling on android because vmin is resized by software keyboard
    useDynamicScaling = !(isCordova() && typeof device !== 'undefined' && device.platform === 'Android');
  }
  return {
    ...state,
    description,
    useDynamicScaling,
  };
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DEVICE_READY:
      return getDeviceReadyState(state);
    case SET_DESCRIPTION:
      return {
        ...state,
        description: action.description,
      };
    case SET_INTERFACE_SCALE:
      return {
        ...state,
        interfaceScale: action.scale,
      };
    case TOGGLE_SETTING:
      return {
        ...state,
        [action.item]: !state[action.item],
      };
    default:
      return state;
  }
}

const deviceReady = () => ({
  type: DEVICE_READY,
});

const setDescription = description => ({
  type: SET_DESCRIPTION,
  description,
});

const setInterfaceScale = scale => ({
  type: SET_INTERFACE_SCALE,
  scale,
});

const toggleSetting = item => ({
  type: TOGGLE_SETTING,
  item,
});

const actionCreators = {
  deviceReady,
  setDescription,
  setInterfaceScale,
  toggleSetting,
};

const actionTypes = {
  SET_DESCRIPTION,
  SET_INTERFACE_SCALE,
  TOGGLE_SETTING,
};

export {
  actionCreators,
  actionTypes,
};
