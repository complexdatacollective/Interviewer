# network-canvas-interviewer

## 6.6.2

- **Fixed interviews not starting in the iOS and Android apps.** Starting or resuming an
  interview showed the loading animation indefinitely, because the mobile build's stylesheet
  compression broke the animation settings the interview screens read. Interviews now open
  normally on mobile.
- **Fixed importing protocol files in the iOS and Android apps.** Choosing a `.netcanvas` file
  with "Import From File" failed with "Protocol could not be imported", because the app looked
  for the picked file inside its own storage instead of where the file picker placed it.
  Protocols now import from Files on iOS and from the file picker on Android.
- **Fixed protocol import.** Every protocol, including the sample protocol, failed to import
  with "Couldn't find validator for schema version 7". The protocol validators were left out of
  the packaged app; they are now included, and protocols import and open again.
- **Exports record the Interviewer version.** The `APP_VERSION` column in exported ego data was
  always empty; it now contains the version of Interviewer that produced the export.
- **Fixed the interview stage menu highlight.** The current and hovered stages in the stage menu
  are now highlighted across the full width of the menu instead of stopping after the label.
- **Fixed missing spaces in several screens.** Text such as "Nonodes in this interview",
  "pressing thealt key", "1 of5" and the CSV export description now has its spaces.
- **Fixed a path traversal weakness when importing protocols.** Importing a protocol file
  (`.netcanvas`) used a ZIP extraction library with a known flaw: a specially crafted archive
  could write files outside the folder it was being unpacked into. It has been replaced with a
  maintained library that refuses these archives. Protocol files that contain links pointing
  outside their own folder, or repeated file names, now fail to import instead of being
  unpacked; ordinary protocols are unaffected.
- **Updated Electron to 43.7.** This brings in the Chromium and Node.js fixes shipped since
  Electron 43.0, including several security fixes for sandboxing and cross-origin file access.
- **Fixed out-of-date results appearing for external data.** When an external data source
  (such as a roster or network file) changed quickly, a slow response for the old source could
  overwrite the newer one. Only the latest request is used now.
- **Updated the mobile libraries.** Capacitor core, Android and iOS were updated to 8.5.2, with
  matching updates to the App, Browser, Device, Filesystem, Share and File Picker plugins.
- **Linux package names.** The `.deb` and `.rpm` packages are named `network-canvas-interviewer`
  again, so they upgrade existing installs in place, and the `.rpm` build no longer fails.
- **More reliable macOS signing.** The build tooling (electron-builder 26.16) unlocks the
  signing keychain correctly, so macOS builds are signed and notarized consistently.
- **Internal improvements.** Many interview screens (name generators, dyad and tie-strength
  census, quick node entry, node forms, the session list and session management) now derive
  their state while rendering instead of in a delayed update. Behaviour is unchanged.

## 6.6.1

- **Fixed a crash on launch.** Version 6.6.0 could fail to start with a "Cannot find module
  'lodash/defaults'" error, caused by a required dependency being left out of the packaged
  app. The app now starts correctly.

## 6.6.0

- **Updated core dependencies.** The technology the app is built on has been brought up to
  date, which improves stability and performance and lays the groundwork for future
  improvements.
- **Compatibility with upcoming macOS versions.** This release ensures the app continues to
  run smoothly on the latest and upcoming versions of macOS.
- **Improved security.** We've adopted current security best practices for building and
  distributing the app — including properly signed and notarized macOS builds — so you can be
  confident the software you download is genuine and safe to run.
- **Removed the "Merge Sessions" export option.** The updated export pipeline always exports
  each interview session as separate files. If you need a combined dataset, you can merge the
  per-session CSV files during analysis instead — see the
  [Data Export documentation](https://documentation.networkcanvas.com/en/analyze-data/data-export#merge-sessions-by-protocol)
  for guidance.

## 6.5.10

### Patch Changes

- Updated dependencies [ae81956]
  - @codaco/network-exporters@1.0.2

## 6.5.9

### Patch Changes

- Updated dependencies
  - @codaco/network-query@1.0.1

## 6.5.8

### Patch Changes

- Updated dependencies [23efeeb]
  - @codaco/network-exporters@1.0.1

## 6.5.7

### Patch Changes

- Updated dependencies [4335dee]
- Updated dependencies [fe48a62]
- Updated dependencies [e31e28d]
  - @codaco/network-exporters@1.0.0
  - @codaco/network-query@1.0.0

## 6.5.6

### Patch Changes

- @codaco/network-exporters@0.1.2
- @codaco/network-query@0.1.2

## 6.5.5

### Patch Changes

- @codaco/network-exporters@0.1.1
- @codaco/network-query@0.1.1
