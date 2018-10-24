import deviceDescription from '../../utils/DeviceInfo';

const SET_DESCRIPTION = 'SETTINGS/SET_DESCRIPTION';
const SET_INTERFACE_SCALE = 'SETTINGS/SET_INTERFACE_SCALE';
const TOGGLE_SETTING = 'SETTINGS/TOGGLE_SETTING';

const initialState = {
  description: deviceDescription(),
  useFullScreenForms: window.matchMedia('screen and (min-device-aspect-ratio: 8/5), (min-device-height: 1800px)').matches,
  useDynamicScaling: true,
  interfaceScale: 100,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
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
