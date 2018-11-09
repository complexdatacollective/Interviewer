/* eslint-env jest */
import reducer, { actionCreators, actionTypes } from '../deviceSettings';

const initialState = {
  description: 'Unknown device',
  useFullScreenForms: true,
  useDynamicScaling: true,
  interfaceScale: 100,
};
const mockDescription = 'My Android Tablet';
const mockSettingToToggle = 'useDynamicScaling';
const mockInterfaceScale = 80;

describe('deviceSettings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should return a device description', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.SET_DESCRIPTION, description: mockDescription });
    expect(reduced).toEqual({ ...initialState, description: mockDescription });
  });

  it('should toggle a device setting', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.TOGGLE_SETTING, item: mockSettingToToggle });
    expect(reduced).toEqual({ ...initialState, [mockSettingToToggle]: false });
  });

  it('should set an interface scale', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.SET_INTERFACE_SCALE, scale: mockInterfaceScale });
    expect(reduced).toEqual({ ...initialState, interfaceScale: mockInterfaceScale });
  });
});

describe('device actions', () => {
  it('should set a description', () => {
    const expectedAction = { type: actionTypes.SET_DESCRIPTION, description: mockDescription };
    expect(actionCreators.setDescription(mockDescription)).toEqual(expectedAction);
  });

  it('should toggle a setting', () => {
    const expectedAction = { type: actionTypes.TOGGLE_SETTING, item: mockSettingToToggle };
    expect(actionCreators.toggleSetting(mockSettingToToggle)).toEqual(expectedAction);
  });

  it('should set interface scale', () => {
    const expectedAction =
      { type: actionTypes.SET_INTERFACE_SCALE, scale: mockInterfaceScale };
    expect(actionCreators.setInterfaceScale(mockInterfaceScale)).toEqual(expectedAction);
  });
});
