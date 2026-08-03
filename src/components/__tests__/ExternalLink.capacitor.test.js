import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/Environment');
vi.mock('@capacitor/browser', () => ({
  Browser: { open: vi.fn(() => Promise.resolve()) },
}));

import { Browser } from '@capacitor/browser';

import { isCapacitor, isElectron } from '../../utils/Environment';
import { openExternalLink } from '../ExternalLink';

beforeEach(() => {
  vi.clearAllMocks();
  isElectron.mockReturnValue(false);
  isCapacitor.mockReturnValue(true);
});

describe('openExternalLink (Capacitor)', () => {
  it('opens via @capacitor/browser', () => {
    openExternalLink('https://example.org');
    expect(Browser.open).toHaveBeenCalledWith({ url: 'https://example.org' });
  });
});
