import { describe, expect, it, vi } from 'vitest';

import { runExport } from '../export/runExport';
import { exportToFile } from '../exportProcess';

vi.mock('../export/runExport', () => ({
  runExport: vi.fn(() => ({ promise: new Promise(() => {}), abort: () => {} })),
}));

vi.mock('../getVersion', () => ({ default: async () => '6.6.2' }));

describe('exportToFile', () => {
  // The exporter writes this into every session's APP_VERSION column; without
  // it, exports did not record which Interviewer produced them.
  it('passes the app version to the export pipeline', async () => {
    const { run } = await exportToFile([]);
    run();

    expect(runExport).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ appVersion: '6.6.2' }),
      }),
    );
  });
});
