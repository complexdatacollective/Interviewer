import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../utils/DeviceInfo');
vi.mock('../../../utils/Environment');

import {
  deviceDescription,
  shouldUseDynamicScaling,
  shouldUseFullScreenForm,
} from '../../../utils/DeviceInfo';
import { isCapacitor } from '../../../utils/Environment';
import reducer, { actionCreators, actionTypes } from '../deviceSettings';

const initialState = {
  crappleWarningHeeded: false,
  description: 'Unknown device',
  enableExperimentalSounds: false,
  enableExperimentalTTS: false,
  exportCSV: true,
  exportGraphML: true,
  interfaceScale: 100,
  screenLayoutHeight: 0,
  screenLayoutWidth: 0,
  showGettingStarted: true,
  showWhatsNew: false,
  startFullScreen: false,
  useDynamicScaling: undefined,
  useFullScreenForms: false,
  useScreenLayoutCoordinates: false,
};
const mockDescription = 'My Android Tablet';
const mockSettingToToggle = 'useDynamicScaling';
const mockInterfaceScale = 80;

describe('deviceSettings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('Capacitor (mobile)', () => {
    beforeEach(() => {
      isCapacitor.mockReturnValue(true);
      shouldUseDynamicScaling.mockReturnValue(false);
      shouldUseFullScreenForm.mockReturnValue(true);
    });

    it('sets useDynamicScaling=false and useFullScreenForms=true after DEVICE_READY', () => {
      const newState = reducer(initialState, {
        type: actionTypes.DEVICE_READY,
      });
      expect(newState.useDynamicScaling).toBe(false);
      expect(newState.useFullScreenForms).toBe(true);
    });
  });

  it('should return a device description', () => {
    const reduced = reducer(initialState, {
      type: actionTypes.SET_DESCRIPTION,
      description: mockDescription,
    });
    expect(reduced).toEqual({ ...initialState, description: mockDescription });
  });

  it('should toggle a device setting', () => {
    const reduced = reducer(initialState, {
      type: actionTypes.TOGGLE_SETTING,
      item: mockSettingToToggle,
    });
    expect(reduced).toEqual({
      ...initialState,
      [mockSettingToToggle]: !initialState[mockSettingToToggle],
    });
  });

  it('should set an interface scale', () => {
    const reduced = reducer(initialState, {
      type: actionTypes.SET_INTERFACE_SCALE,
      scale: mockInterfaceScale,
    });
    expect(reduced).toEqual({
      ...initialState,
      interfaceScale: mockInterfaceScale,
    });
  });
});

describe('deviceReady thunk', () => {
  it('dispatches DEVICE_READY then SET_DESCRIPTION with awaited device description', async () => {
    deviceDescription.mockResolvedValue('iPad Air - 17.0');
    shouldUseDynamicScaling.mockReturnValue(false);
    shouldUseFullScreenForm.mockReturnValue(true);

    const dispatch = vi.fn();
    await actionCreators.deviceReady()(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.DEVICE_READY });
    expect(dispatch).toHaveBeenCalledWith({
      type: actionTypes.SET_DESCRIPTION,
      description: 'iPad Air - 17.0',
    });
  });
});

describe('device actions', () => {
  it('should set a description', () => {
    const expectedAction = {
      type: actionTypes.SET_DESCRIPTION,
      description: mockDescription,
    };
    expect(actionCreators.setDescription(mockDescription)).toEqual(
      expectedAction,
    );
  });

  it('should toggle a setting', () => {
    const expectedAction = {
      type: actionTypes.TOGGLE_SETTING,
      item: mockSettingToToggle,
    };
    expect(actionCreators.toggleSetting(mockSettingToToggle)).toEqual(
      expectedAction,
    );
  });

  it('should set interface scale', () => {
    const expectedAction = {
      type: actionTypes.SET_INTERFACE_SCALE,
      scale: mockInterfaceScale,
    };
    expect(actionCreators.setInterfaceScale(mockInterfaceScale)).toEqual(
      expectedAction,
    );
  });
});
