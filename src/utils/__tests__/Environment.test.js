import { afterEach, describe, expect, it } from 'vitest';

import { isAndroid, isCapacitor, isIOS } from '../Environment';
import environments from '../environments';

const setCapacitor = (platform) => {
  window.Capacitor = {
    isNativePlatform: () => platform !== 'web',
    getPlatform: () => platform,
  };
};

afterEach(() => {
  delete window.Capacitor;
});

describe('Capacitor environment detection', () => {
  it('detects a native Capacitor platform', () => {
    setCapacitor('ios');
    expect(isCapacitor()).toBe(true);
    expect(isIOS()).toBe(true);
    expect(isAndroid()).toBe(false);
  });

  it('treats Capacitor "web" platform as not-native', () => {
    setCapacitor('web');
    expect(isCapacitor()).toBe(false);
  });

  it('exposes CAPACITOR (not CORDOVA) in the environments enum', () => {
    expect(environments.CAPACITOR).toBeTypeOf('symbol');
    expect(environments.CORDOVA).toBeUndefined();
  });
});
