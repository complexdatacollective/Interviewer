import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Environment');
import { getEnvironment, isElectron } from '../../Environment';
import environments from '../../environments';

vi.mock('../../filesystem', () => ({
  resolveFileSystemUrl: vi.fn(() =>
    Promise.resolve({ toURL: () => 'file:///DATA/protocols/p/assets/x.png' }),
  ),
  userDataPath: () => '',
}));

beforeEach(() => {
  getEnvironment.mockReturnValue(environments.CAPACITOR);
  isElectron.mockReturnValue(false);
  window.Capacitor = {
    convertFileSrc: (u) =>
      `https://localhost/_capacitor_file_${u.replace('file://', '')}`,
  };
});

import getMediaAssetUrl from '../getMediaAssetUrl';

describe('getMediaAssetUrl (Capacitor)', () => {
  it('returns a convertFileSrc URL', async () => {
    const url = await getMediaAssetUrl('p', 'x.png');
    expect(url).toBe(
      'https://localhost/_capacitor_file_/DATA/protocols/p/assets/x.png',
    );
  });
});
