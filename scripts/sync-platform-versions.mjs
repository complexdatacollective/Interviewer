#!/usr/bin/env node
// Sync apps/interviewer/package.json `version` -> iOS Xcode + Android gradle.
//
// iOS:     MARKETING_VERSION in ios/App/App.xcodeproj/project.pbxproj
//          (CFBundleShortVersionString). App Store rejects pre-release
//          qualifiers, so this script strips `-alpha.N` etc. -- only the
//          numeric "X.Y.Z" prefix is written.
//
// Android: versionName in android/app/build.gradle. Allows arbitrary
//          strings, so the full version (including any pre-release
//          suffix) is written.
//
// Build counters (CURRENT_PROJECT_VERSION on iOS, versionCode on Android)
// are deliberately NOT touched -- those are integers that must increase
// monotonically per store submission and are managed separately from the
// semver `version` field.
//
// Idempotent: re-runs are no-ops once everything is in sync.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');

const pkgPath = resolve(appRoot, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

const semver = /^(\d+)\.(\d+)\.(\d+)(?:-[\w.]+)?(?:\+[\w.]+)?$/.exec(version);
if (!semver) {
  console.error(
    `sync-platform-versions: package.json version "${version}" is not a valid semver`,
  );
  process.exit(1);
}
const [, major, minor, patch] = semver;
const marketingVersion = `${major}.${minor}.${patch}`;
const androidVersionName = version;

function replaceInFile(file, pattern, replacement, label) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(
        `sync-platform-versions: ${label} not found (${file}) -- skipped`,
      );
      return;
    }
    throw err;
  }

  const updated = content.replace(pattern, replacement);
  if (updated === content) {
    console.log(`sync-platform-versions: ${label} already in sync`);
    return;
  }
  writeFileSync(file, updated);
  console.log(`sync-platform-versions: updated ${label}`);
}

const pbxproj = resolve(appRoot, 'ios/App/App.xcodeproj/project.pbxproj');
replaceInFile(
  pbxproj,
  /(MARKETING_VERSION = )[^;]+(;)/g,
  `$1${marketingVersion}$2`,
  `iOS MARKETING_VERSION -> ${marketingVersion}`,
);

const gradle = resolve(appRoot, 'android/app/build.gradle');
replaceInFile(
  gradle,
  /(versionName )"[^"]*"/g,
  `$1"${androidVersionName}"`,
  `Android versionName -> "${androidVersionName}"`,
);
