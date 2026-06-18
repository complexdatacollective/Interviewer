/**
 * Electron Builder Configuration
 * @see https://www.electron.build/configuration/configuration
 *
 * Moved out of package.json's `build` field so macOS notarization can be
 * gated on the presence of App Store Connect API credentials at build time
 * (matching apps/interviewer-v8 and apps/architect).
 */
module.exports = {
  extends: null,
  files: [
    'out/**/*',
    'node_modules/**/*',
    '!node_modules/.bin',
    '!node_modules/.cache',
    '!node_modules/.pnpm',
    '!node_modules/**/*.md',
    '!node_modules/**/*.d.ts',
    '!node_modules/**/test/**',
    '!node_modules/**/tests/**',
    '!node_modules/**/__tests__/**',
    '!node_modules/**/docs/**',
    '!node_modules/**/LICENSE*',
    '!node_modules/**/CHANGELOG*',
    '!node_modules/**/README*',
    '!node_modules/**/*.map',
    '!node_modules/**/app-builder-lib/**',
    '!node_modules/**/dmg-builder/**',
    '!node_modules/**/electron-builder/**',
    '!node_modules/**/electron-publish/**',
    '!node_modules/**/builder-util/**',
    '!node_modules/**/builder-util-runtime/**',
    '!node_modules/**/node-gyp/**',
    '!node_modules/**/cacache/**',
    '!node_modules/**/npm/**',
    '!node_modules/**/gyp/**',
    '!node_modules/**/@electron/rebuild/**',
    '!node_modules/**/eslint*/**',
    '!node_modules/**/typescript/**',
    '!node_modules/**/stylelint*/**',
    '!node_modules/**/vitest/**',
    '!node_modules/**/@vitest/**',
    '!node_modules/**/vite/**',
    '!node_modules/**/@babel/core/**',
    '!node_modules/**/@babel/parser/**',
    '!node_modules/**/lodash/**',
  ],
  extraResources: ['./build-resources/externals/**'],
  appId: 'Network-Canvas-Interviewer-6',
  directories: {
    buildResources: 'build-resources',
    output: 'release-builds',
  },
  nsis: {
    include: 'build-resources/scripts/bonjour.nsh',
  },
  win: {
    target: 'nsis',
    // Windows builds ship unsigned (no code-signing certificate configured).
  },
  mac: {
    category: 'public.app-category.education',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: './build-resources/entitlements.mac.inherit.plist',
    entitlementsInherit: './build-resources/entitlements.mac.inherit.plist',
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
    // Notarize via electron-builder's built-in notarytool when credentials are
    // present — either App Store Connect API key (APPLE_API_KEY/APPLE_API_KEY_ID/
    // APPLE_API_ISSUER) or Apple ID (APPLE_ID/APPLE_APP_SPECIFIC_PASSWORD/
    // APPLE_TEAM_ID). Evaluates to false on local/unsigned builds, skipping it.
    notarize: Boolean(process.env.APPLE_API_KEY || process.env.APPLE_ID),
  },
  linux: {
    maintainer: 'Joshua Melville <joshmelville@gmail.com>',
    target: [
      { target: 'deb', arch: ['x64', 'arm64'] },
      { target: 'rpm', arch: ['x64', 'arm64'] },
      { target: 'AppImage', arch: ['x64', 'arm64'] },
      { target: 'tar.gz', arch: ['x64', 'arm64'] },
    ],
  },
  publish: [
    {
      provider: 'github',
      owner: 'complexdatacollective',
      repo: 'interviewer',
    },
  ],
};
