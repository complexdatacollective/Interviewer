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
// Build numbers: versionCode (Android) and CURRENT_PROJECT_VERSION (iOS
// CFBundleVersion) are both
// (major * 10000 + minor * 100 + patch) * 100 + upload, so 6.6.2 ->
// 6060200. The stores require a new, higher number for every upload;
// deriving it from the version keeps it rising with each release and
// above every earlier upload (the Cordova builds used 4-digit codes, and
// 6.6.2 was first uploaded as 60602). The last two digits count re-uploads
// of one version: to upload 6.6.2 again, raise both numbers to 6060201.
// This script keeps a raised number while the version stays the same and
// resets it when the version changes. Pre-releases of one version share
// its numbers.
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
if (Number(minor) > 99 || Number(patch) > 99) {
  console.error(
    `sync-platform-versions: ${version} cannot be encoded as a build number (minor and patch must be below 100)`,
  );
  process.exit(1);
}
const buildBase = Number(major) * 10000 + Number(minor) * 100 + Number(patch);
const buildNumber = String(buildBase * 100);

// Keeps a build number already raised for a re-upload of this version.
const syncBuildNumber = (match, prefix, current, suffix) =>
  /^\d+$/.test(current) && Math.floor(Number(current) / 100) === buildBase
    ? match
    : `${prefix}${buildNumber}${suffix}`;
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
replaceInFile(
  pbxproj,
  /(CURRENT_PROJECT_VERSION = )([^;]+)(;)/g,
  syncBuildNumber,
  `iOS CURRENT_PROJECT_VERSION -> ${buildNumber}`,
);

const gradle = resolve(appRoot, 'android/app/build.gradle');
replaceInFile(
  gradle,
  /(versionName )"[^"]*"/g,
  `$1"${androidVersionName}"`,
  `Android versionName -> "${androidVersionName}"`,
);
replaceInFile(
  gradle,
  /(versionCode )(\d+)()/g,
  syncBuildNumber,
  `Android versionCode -> ${buildNumber}`,
);
