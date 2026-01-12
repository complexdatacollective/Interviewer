/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { checkEndpoint, getPlatformSpecificContent } from '../useUpdater';
import * as Environment from '../../utils/Environment';

vi.useFakeTimers();

const mockAssets = [
  {
    url: 'https://website.com/assets/17474844',
    id: 17474844,
    node_id: 'MDEyOlJlbGVhc2VBc3NldDE3NDc0ODQ0',
    name: 'latest.yml',
    content_type: 'text/yaml',
    size: 356,
    created_at: '2020-01-21T09:30:44Z',
    updated_at: '2020-01-21T09:30:44Z',
    browser_download_url: 'https://website.com/latest.yml',
  },
  {
    url: 'https://website.com/assets/17477882',
    id: 17477882,
    node_id: 'MDEyOlJlbGVhc2VBc3NldDE3NDc3ODgy',
    name: 'installer.zip',
    content_type: 'application/zip',
    size: 64547558,
    created_at: '2020-01-21T12:00:35Z',
    updated_at: '2020-01-21T12:13:21Z',
    browser_download_url: 'https://website.com/installer.zip',
  },
  {
    url: 'https://website.com/assets/17474888',
    id: 17474888,
    node_id: 'MDEyOlJlbGVhc2VBc3NldDE3NDc0ODg4',
    name: 'installer.dmg',
    content_type: 'application/octet-stream',
    size: 64860211,
    created_at: '2020-01-21T09:32:48Z',
    updated_at: '2020-01-21T09:34:59Z',
    browser_download_url: 'https://website.com/installer.dmg',
  },
  {
    url: 'https://website.com/assets/17474842',
    id: 17474842,
    node_id: 'MDEyOlJlbGVhc2VBc3NldDE3NDc0ODQy',
    name: 'installer.exe',
    content_type: 'application/octet-stream',
    size: 47551168,
    created_at: '2020-01-21T09:30:34Z',
    updated_at: '2020-01-21T09:30:43Z',
    browser_download_url: 'https://website.com/installer.exe',
  },
];

const mockJson = vi.fn(() => ({
  name: '1.0.0',
  body: 'This is a newer version probably',
  assets: mockAssets, // eslint-disable-line
}));

describe('getPlatformSpecificContent()', () => {
  let isWindowsSpy;
  let isMacOSSpy;
  let isLinuxSpy;
  let isAndroidSpy;
  let isIOSSpy;

  beforeEach(() => {
    isWindowsSpy = vi.spyOn(Environment, 'isWindows').mockReturnValue(false);
    isMacOSSpy = vi.spyOn(Environment, 'isMacOS').mockReturnValue(false);
    isLinuxSpy = vi.spyOn(Environment, 'isLinux').mockReturnValue(false);
    isAndroidSpy = vi.spyOn(Environment, 'isAndroid').mockReturnValue(false);
    isIOSSpy = vi.spyOn(Environment, 'isIOS').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets EXE asset for Windows platform', () => {
    isWindowsSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent(mockAssets);
    expect(content.buttonLink).toBe('https://website.com/installer.exe');
  });

  it('gets DMG asset for macoS platform', () => {
    isMacOSSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent(mockAssets);
    expect(content.buttonLink).toBe('https://website.com/installer.dmg');
  });

  it('links to GitHub for Linux platform', () => {
    isLinuxSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent(mockAssets);
    expect(content.buttonLink).toBe('https://github.com/complexdatacollective/Interviewer/releases/latest');
  });

  it('links to download page if asset not available', () => {
    isLinuxSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent([]);
    expect(content.buttonLink).toBe('https://networkcanvas.com/download.html');
  });

  it('links to Play Store on Android', () => {
    isAndroidSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent(mockAssets);
    expect(content.buttonLink).toBe('https://play.google.com/store/apps/details?id=org.codaco.NetworkCanvasInterviewer6');
  });

  it('links to App Store on iOS', () => {
    isIOSSpy.mockReturnValue(true);

    const content = getPlatformSpecificContent(mockAssets);
    expect(content.buttonLink).toBe('https://apps.apple.com/us/app/network-canvas-interviewer/id1538673677');
  });
});

describe('checkEndpoint()', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.resolve({ json: mockJson }));
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('when app is the latest version', async () => {
    const subject = await checkEndpoint('foo', '1.0.0');
    expect(subject).toBe(false);
  });

  it('when app is a later version than the released version!', async () => {
    const subject = await checkEndpoint('foo', '2.0.0');
    expect(subject).toBe(false);
  });

  it('when there is an update available', async () => {
    const subject = await checkEndpoint('foo', '0.5.0');
    expect(subject).toEqual({
      newVersion: '1.0.0',
      releaseNotes: 'This is a newer version probably',
      releaseAssets: mockAssets, // eslint-disable-line
    });
  });

  it('fails silently', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('bad url')));

    const subject = await checkEndpoint('foo', '0.5.0');

    expect(subject).toEqual(false);
  });
});
