import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Environment', () => ({
  isElectron: vi.fn(),
  isCapacitor: vi.fn(),
}));

vi.mock('../../filesystem', () => ({
  writeFile: vi.fn(() => Promise.resolve()),
}));

const fsMock = vi.hoisted(() => ({
  writeFile: vi.fn(() => Promise.resolve({ uri: 'file:///CACHE/out.zip' })),
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: fsMock,
  Directory: { Cache: 'CACHE' },
}));

const shareMock = vi.hoisted(() => ({
  share: vi.fn(() => Promise.resolve()),
}));

vi.mock('@capacitor/share', () => ({
  Share: shareMock,
}));

import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { isCapacitor, isElectron } from '../../Environment';
import { writeFile } from '../../filesystem';
import { saveExportBlob } from '../saveExport';

// Minimal Blob-like stub: saveExportBlob only needs `.arrayBuffer()`, and
// jsdom's Blob does not implement it (real Electron/Capacitor webviews do).
const makeBlob = () => {
  const bytes = new Uint8Array([1, 2, 3, 4]);
  return { arrayBuffer: () => Promise.resolve(bytes.buffer) };
};

describe('saveExportBlob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isElectron.mockReturnValue(false);
    isCapacitor.mockReturnValue(false);
  });

  it('on Electron, prompts a save dialog and writes the chosen path as a Buffer', async () => {
    isElectron.mockReturnValue(true);
    window.electronAPI.dialog.showSaveDialog = vi.fn(() =>
      Promise.resolve({ canceled: false, filePath: '/tmp/out.zip' }),
    );

    const result = await saveExportBlob({
      blob: makeBlob(),
      fileName: 'out.zip',
    });

    expect(window.electronAPI.dialog.showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({ defaultPath: 'out.zip' }),
    );
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [path, data] = writeFile.mock.calls[0];
    expect(path).toBe('/tmp/out.zip');
    // A Buffer (a Uint8Array subclass) carrying the zip bytes; writeFile's
    // Electron branch base64-encodes Buffer/Uint8Array for IPC transport.
    expect(data).toBeInstanceOf(Uint8Array);
    expect([...data]).toEqual([1, 2, 3, 4]);
    expect(result).toEqual({ saved: true, path: '/tmp/out.zip' });
  });

  it('on Electron, returns saved:false and does not write when the dialog is canceled', async () => {
    isElectron.mockReturnValue(true);
    window.electronAPI.dialog.showSaveDialog = vi.fn(() =>
      Promise.resolve({ canceled: true, filePath: undefined }),
    );

    const result = await saveExportBlob({
      blob: makeBlob(),
      fileName: 'out.zip',
    });

    expect(writeFile).not.toHaveBeenCalled();
    expect(result).toEqual({ saved: false, path: null });
  });

  it('on Capacitor, writes to the cache dir then opens the share sheet', async () => {
    isCapacitor.mockReturnValue(true);
    const result = await saveExportBlob({
      blob: makeBlob(),
      fileName: 'out.zip',
    });
    expect(Filesystem.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'out.zip', directory: 'CACHE' }),
    );
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'file:///CACHE/out.zip' }),
    );
    expect(result).toEqual({ saved: true, path: 'file:///CACHE/out.zip' });
  });

  it('on Capacitor, swallows a share cancellation and still resolves saved:true', async () => {
    isCapacitor.mockReturnValue(true);
    Share.share.mockRejectedValueOnce(new Error('Share canceled'));

    const result = await saveExportBlob({
      blob: makeBlob(),
      fileName: 'out.zip',
    });

    expect(Filesystem.writeFile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ saved: true, path: 'file:///CACHE/out.zip' });
  });

  it('on Capacitor, re-throws a genuine (non-cancellation) share error', async () => {
    isCapacitor.mockReturnValue(true);
    Share.share.mockRejectedValueOnce(new Error('No delegate found'));

    await expect(
      saveExportBlob({ blob: makeBlob(), fileName: 'out.zip' }),
    ).rejects.toThrow(/No delegate/);
  });

  it('throws on an unsupported platform', async () => {
    await expect(
      saveExportBlob({ blob: makeBlob(), fileName: 'out.zip' }),
    ).rejects.toThrow(/not supported/);
    expect(writeFile).not.toHaveBeenCalled();
  });
});
