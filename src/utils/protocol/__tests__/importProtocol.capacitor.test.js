import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Environment');
vi.mock('@capawesome/capacitor-file-picker', () => ({
  FilePicker: { pickFiles: vi.fn() },
}));
vi.mock('../../ducks/store', () => ({
  store: { dispatch: vi.fn(), getState: vi.fn() },
}));

import { FilePicker } from '@capawesome/capacitor-file-picker';

import { isCapacitor, isElectron } from '../../Environment';
import { beginLocalProtocolImport } from '../importProtocol';

afterEach(() => vi.clearAllMocks());

describe('beginLocalProtocolImport (Capacitor)', () => {
  it('picks a file and starts a file import', async () => {
    isElectron.mockReturnValue(false);
    isCapacitor.mockReturnValue(true);
    FilePicker.pickFiles.mockResolvedValue({
      files: [{ path: '/x/p.netcanvas', name: 'p.netcanvas' }],
    });

    await beginLocalProtocolImport();
    expect(FilePicker.pickFiles).toHaveBeenCalledWith({
      types: ['application/octet-stream'],
      limit: 1,
    });
  });

  it('returns undefined when no file is picked', async () => {
    isElectron.mockReturnValue(false);
    isCapacitor.mockReturnValue(true);
    FilePicker.pickFiles.mockResolvedValue({ files: [] });

    const result = await beginLocalProtocolImport();
    expect(FilePicker.pickFiles).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
