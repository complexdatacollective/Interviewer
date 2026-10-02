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

  // The file picker returns the picked file's own URI. Joining it onto
  // Directory.Data made every protocol import from Files fail to read.
  it('passes a picked file:// URI through without a directory', () => {
    const uri =
      'file:///private/var/mobile/Containers/Data/Application/X/tmp/p.netcanvas';
    expect(capacitorPath(uri)).toEqual({ path: uri });
  });

  it('passes an Android content:// URI through without a directory', () => {
    const uri = 'content://com.android.providers.downloads/document/42';
    expect(capacitorPath(uri)).toEqual({ path: uri });
  });
});
