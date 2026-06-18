import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../Environment');
vi.mock('@capacitor/app', () => ({
  App: { getInfo: vi.fn(() => Promise.resolve({ version: '6.5.4' })) },
}));

import { App } from '@capacitor/app';

import { isCapacitor, isElectron } from '../Environment';
import getVersion from '../getVersion';

beforeEach(() => {
  vi.clearAllMocks();
  isElectron.mockReturnValue(false);
  isCapacitor.mockReturnValue(true);
});

describe('getVersion (Capacitor)', () => {
  it('returns the native app version', async () => {
    expect(await getVersion()).toBe('6.5.4');
    expect(App.getInfo).toHaveBeenCalled();
  });
});
