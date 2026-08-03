import { describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA', Cache: 'CACHE' },
}));

import { capacitorPath } from '../capacitorPath';

describe('capacitorPath', () => {
  it('maps an app path to Directory.Data with a leading slash stripped', () => {
    expect(capacitorPath('/protocols/abc/assets/x.png')).toEqual({
      directory: 'DATA',
      path: 'protocols/abc/assets/x.png',
    });
  });

  it('passes relative paths through unchanged', () => {
    expect(capacitorPath('tmp/export.zip')).toEqual({
      directory: 'DATA',
      path: 'tmp/export.zip',
    });
  });
});
