import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../sync-platform-versions.mjs',
);

const PBXPROJ = 'ios/App/App.xcodeproj/project.pbxproj';
const GRADLE = 'android/app/build.gradle';

let root;

// A copy of the script in an app-shaped tree, so it edits fixtures.
function setUp({ version, iosBuild, androidBuild }) {
  root = mkdtempSync(join(tmpdir(), 'sync-platform-versions-'));
  mkdirSync(join(root, 'scripts'));
  copyFileSync(script, join(root, 'scripts/sync-platform-versions.mjs'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version }));
  mkdirSync(join(root, dirname(PBXPROJ)), { recursive: true });
  const config = `MARKETING_VERSION = 1.0.0;\nCURRENT_PROJECT_VERSION = ${iosBuild};\n`;
  writeFileSync(join(root, PBXPROJ), `${config}${config}`);
  mkdirSync(join(root, dirname(GRADLE)), { recursive: true });
  writeFileSync(
    join(root, GRADLE),
    `defaultConfig {\n    versionCode ${androidBuild}\n    versionName "1.0.0"\n}\n`,
  );
}

function sync() {
  execFileSync(
    process.execPath,
    [join(root, 'scripts/sync-platform-versions.mjs')],
    {
      stdio: 'pipe',
    },
  );
  return {
    ios: [
      ...readFileSync(join(root, PBXPROJ), 'utf8').matchAll(
        /CURRENT_PROJECT_VERSION = ([^;]+);/g,
      ),
    ].map((m) => m[1]),
    marketing: [
      ...readFileSync(join(root, PBXPROJ), 'utf8').matchAll(
        /MARKETING_VERSION = ([^;]+);/g,
      ),
    ].map((m) => m[1]),
    gradle: readFileSync(join(root, GRADLE), 'utf8'),
  };
}

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('sync-platform-versions', () => {
  it('derives both build numbers from the version', () => {
    setUp({ version: '6.6.2', iosBuild: '1', androidBuild: '1' });
    const result = sync();
    expect(result.ios).toEqual(['6060200', '6060200']);
    expect(result.marketing).toEqual(['6.6.2', '6.6.2']);
    expect(result.gradle).toContain('versionCode 6060200\n');
    expect(result.gradle).toContain('versionName "6.6.2"');
  });

  it('keeps a build number raised for a re-upload of the same version', () => {
    setUp({ version: '6.6.2', iosBuild: '6060201', androidBuild: '6060202' });
    const result = sync();
    expect(result.ios).toEqual(['6060201', '6060201']);
    expect(result.gradle).toContain('versionCode 6060202\n');
  });

  it('resets the build number when the version changes', () => {
    setUp({ version: '6.6.3', iosBuild: '6060201', androidBuild: '6060201' });
    const result = sync();
    expect(result.ios).toEqual(['6060300', '6060300']);
    expect(result.gradle).toContain('versionCode 6060300\n');
  });

  it('replaces an older encoding of the same version', () => {
    setUp({ version: '6.6.2', iosBuild: '60602.1', androidBuild: '60602' });
    const result = sync();
    expect(result.ios).toEqual(['6060200', '6060200']);
    expect(result.gradle).toContain('versionCode 6060200\n');
  });

  it('writes the full pre-release version name only to Android', () => {
    setUp({ version: '6.7.0-alpha.1', iosBuild: '1', androidBuild: '1' });
    const result = sync();
    expect(result.marketing).toEqual(['6.7.0', '6.7.0']);
    expect(result.gradle).toContain('versionName "6.7.0-alpha.1"');
    expect(result.ios).toEqual(['6070000', '6070000']);
  });
});
