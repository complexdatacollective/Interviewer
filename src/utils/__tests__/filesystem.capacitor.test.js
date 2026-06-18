import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../Environment');
import { getEnvironment, isCapacitor } from '../Environment';
import environments from '../environments';

const fsMock = vi.hoisted(() => ({
  readFile: vi.fn(() =>
    Promise.resolve({ data: Buffer.from('hi').toString('base64') }),
  ),
  writeFile: vi.fn(() => Promise.resolve({ uri: 'file:///x' })),
  mkdir: vi.fn(() => Promise.resolve()),
  rmdir: vi.fn(() => Promise.resolve()),
  rename: vi.fn(() => Promise.resolve()),
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: fsMock,
  Directory: { Data: 'DATA', Cache: 'CACHE' },
}));

import { readFile, userDataPath, writeFile } from '../filesystem';

beforeEach(() => {
  vi.clearAllMocks();
  isCapacitor.mockReturnValue(true);
  getEnvironment.mockReturnValue(environments.CAPACITOR);
});

describe('filesystem (Capacitor)', () => {
  it('userDataPath() is the Directory.Data root', () => {
    expect(userDataPath()).toBe('');
  });

  it('readFile decodes base64 to a Buffer', async () => {
    const buf = await readFile('/protocols/p/file.json');
    expect(fsMock.readFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'protocols/p/file.json',
        directory: 'DATA',
      }),
    );
    expect(buf.toString()).toBe('hi');
  });

  it('writeFile base64-encodes binary and writes recursively', async () => {
    await writeFile('/protocols/p/out.bin', Buffer.from([1, 2, 3]));
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'protocols/p/out.bin',
        directory: 'DATA',
        recursive: true,
      }),
    );
    expect(fsMock.writeFile.mock.calls[0][0].data).toBe(
      Buffer.from([1, 2, 3]).toString('base64'),
    );
  });
});
