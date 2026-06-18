import { Buffer } from 'buffer';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Environment');
vi.mock('../../filesystem');

const { CapacitorHttp } = vi.hoisted(() => ({
  CapacitorHttp: { get: vi.fn() },
}));
vi.mock('@capacitor/core', () => ({ CapacitorHttp }));

import { getEnvironment } from '../../Environment';
import environments from '../../environments';
import { tempDataPath, writeFile } from '../../filesystem';

// CapacitorHttp returns binary (`arraybuffer`) response bodies as base64 on native.
const base64Body = Buffer.from([1, 2, 3]).toString('base64');

const setupHttp = ({ status = 200 } = {}) => {
  CapacitorHttp.get.mockResolvedValue({
    status,
    data: base64Body,
    headers: {},
    url: '',
  });
};

beforeEach(() => {
  getEnvironment.mockReturnValue(environments.CAPACITOR);
  tempDataPath.mockReturnValue('tmp/');
  writeFile.mockResolvedValue(undefined);
  setupHttp();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Dynamic import so vi.mock hoisting takes effect before the module is loaded.
const getDownloadProtocol = () =>
  import('../downloadProtocol').then((m) => m.default);

describe('downloadProtocol (Capacitor)', () => {
  it('downloads via native HTTP (CapacitorHttp), not a webview fetch, to bypass CORS', async () => {
    const downloadProtocol = await getDownloadProtocol();
    const uri = 'https://example.com/protocol.netcanvas';
    await downloadProtocol(uri);
    expect(CapacitorHttp.get).toHaveBeenCalledWith({
      url: uri,
      responseType: 'arraybuffer',
    });
  });

  it('decodes the base64 body and writes it to the temp dir', async () => {
    const downloadProtocol = await getDownloadProtocol();
    const destination = await downloadProtocol(
      'https://example.com/protocol.netcanvas',
    );

    expect(destination).toMatch(/^tmp\//);
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [path, data] = writeFile.mock.calls[0];
    expect(path).toBe(destination);
    expect(data).toBeInstanceOf(Uint8Array); // Buffer is a Uint8Array subclass
    expect([...data]).toEqual([1, 2, 3]);
  });

  it('resolves to the destination path string', async () => {
    const downloadProtocol = await getDownloadProtocol();
    const result = await downloadProtocol('https://example.com/p.netcanvas');
    expect(typeof result).toBe('string');
    expect(result.startsWith('tmp/')).toBe(true);
  });

  it('throws on a non-2xx HTTP status', async () => {
    setupHttp({ status: 404 });
    const downloadProtocol = await getDownloadProtocol();
    await expect(
      downloadProtocol('https://example.com/p.netcanvas'),
    ).rejects.toThrow(/HTTP 404/);
  });

  it('attaches a friendly message when the native request rejects', async () => {
    CapacitorHttp.get.mockRejectedValue(new Error('offline'));
    const downloadProtocol = await getDownloadProtocol();
    await expect(
      downloadProtocol('https://example.com/p.netcanvas'),
    ).rejects.toMatchObject({
      friendlyMessage: expect.stringMatching(/fetch/i),
    });
  });
});
