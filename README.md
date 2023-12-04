# Network Canvas Interviewer [![Build Status](https://travis-ci.org/complexdatacollective/interviewer.svg?branch=master)](https://travis-ci.org/codaco/Network-Canvas) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcodaco%2FNetwork-Canvas.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcodaco%2FNetwork-Canvas?ref=badge_shield)

Technologies used:
ES6 (via Babel)
React
Redux
Electron
Cordova
SCSS
Jest (Testing suite)
React Scripts

# Operation

## Node/NPM Version

This project currently requires version `14.21.3` of node, and version `8.3.2` of npm. These are the only supported versions for this project.

As a convenience, the repository contains a `.node-version` file that enables convinient use of a node environment manager.

## Windows Environment

There are some additional requirements for the [MDNS](https://www.npmjs.com/package/mdns) native dependency.

### Before running `npm install`

1. Run powershell as admin (right-click option) and then run:
```
npm --add-python-to-path install --global windows-build-tools
```
2. Install [Bonjour SDK for Windows](https://developer.apple.com/download/more/?=Bonjour%20SDK%20for%20Windows)
(requires an apple id associated with a paid team account). Select "Bonjour SDK for Windows v.3.0". `BONJOUR_SDK_HOME` should be set for you after installation completes.
3. Restart powershell and continue with [project installation](#installation).

### After running `npm install`

Once you've completed `npm install`, you will need to rebuild MDNS with the Electron headers:

```
cd node_modules\mdns
npx node-gyp rebuild --target=9.0.0 --arch=x64 --dist-url=https://electronjs.org/headers
```

`target` must match the electron version installed by npm

#### Linux MDNS

On Debian like systems, you may need to enable ipv6 dns resolution. Do this by ensuring:

```
hosts: files mdns4_minimal mdns6_minimal [NOTFOUND=return] dns
```

Is added to to `/etc/msswitch.conf`.

### Troubleshooting

- Native dependencies won't compile
  + `windows-build-tools` should have installed the required compilers
  + [MS notes on config for native modules](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules)
  + ...You could install python and VS Build Tools manually; you should *not* need all of Visual Studio
- Runtime error related to DLL initialization
  + Make sure the "rebuild" step above works
  + [More Info](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md#using-native-node-modules)
- MDNS doesn't work on linux (getaddr
  + Try adding `hosts: files mdns4_minimal mdns6_minimal [NOTFOUND=return] dns` to `/etc/msswitch.conf`

## Installation

0. Install the correct node and npm versions.
1. Clone this repository.
2. Fetch submodules by typing `git submodule update --init --recursive -f`.
3. Enter the directory where the repository is cloned, and install the project dependencies by typing `npm install`.
4. Refer to the development tasks section below to learn how to test and build the app.

Note: for Apple Silicon users, you need to install the `electron` package manually:

```sh
  npm install electron --arch=x64
```

## Development Tasks

|`npm run <script>`|Description|
|------------------|-----------|
|`start:[platform]`|Serves your app at `localhost:3000` targeted at the platform you specify.|
|`dev:[platform]`|Run a live-reloading build of the app, targeted at the platform you specify. Requires the live server to be running (see start task).|
|`build:[platform]`|Compiles assets and prepares app for production on the given platform.|
|`test`|Runs testing suite.|
|`generate-icons`|Uses icon-gen package to generate iconsets and icon files for OSX and Windows.|
|`dist:[platform]`|Uses electron-packager or cordova to package a release for the specified platform.|
|`lint`|Lints the project according to our eslint configuration|
|`sass-lint`|Lints the project's SASS files only, according to our sass-lint configuration.|

## Quick development reference

- In-browser development: `npm start`
- Platform-specific development: `npm run start:[platform]` and `npm run dev:[platform]`, where `platform` is one of `android`, `electron`, or `ios`.
  + Currently, you can only run *one platform at a time*

See below for installation, options, and information on platform specifics.

## Cordova Builds

1. Install [cordova](https://cordova.apache.org) on your system: `npm install -g cordova`
2. If you haven't already, build the project: `npm run build`
  - Without the `www/` directory, cordova commands won't recognize this as a valid project.
3. Install platforms and plugins for the project: `cordova prepare`

See Cordova's [iOS docs](http://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html) and [Android docs](http://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) for requirements, configuration, and deploy instructions.

### Local Development & Testing

Starting the web app: If you have a running webpack dev server (started with `npm start`), you can run dev cordova builds on devices & emulators with live reloading.

Starting a device or simulator: Run `npm run dev:[android|ios]`. This is a thin wrapper around `cordova run [android|ios]`; you can pass arguments to the cordova script with an extra pair of dashes. For example: `npm run dev:android -- --emulator`, or `npm run dev:ios -- --target="iPad-Pro, 11.4"`. Changes will be picked up from the dev server.

This assumes you have the relevant platform development tools installed. For a list of Apple simulator types ("iPad-Pro") and runtimes ("11.4"), try `xcrun simctl list`.

*Known issue & caveat*: this requires temporarily changing `config.xml` contents to build a development app; if everything goes well, the changes are cleaned up upon completion. However, a Cordova build error (for example) can leave config.xml in this 'development' state.

#### Full Cordova support

To get full Cordova support, with native integration & plugins:

1. (one time) `cordova build [android|ios]` to install cordova deps, plugins, and static (public) app resources
2. `npm run start:[android|ios]` to start the dev server (React app)
3. `npm run dev:[android|ios]` as above

However, this comes with some limitations:
- You can only to run dev server content from a device or simulator on that platform. (Running simultaneous android clients is fine; running electron concurrently requires starting another server in another directory.)
- All 'public' files, including protocols, are statically bundled with the app. These are sourced from the `www` directory in the cordova build step, so changes to any file in public requires a full `npm build` and then restarting the dev device as above.

## Electron development

- `npm run start:electron` starts the dev server (React app)
- `npm run dev:electron` start Electron, pointed at the dev server

Troubleshooting:

- If a dev cordova build is interrupted, you may find that `config.xml` has changes, and that there's a `config.xml.original` file (ignored by git). You may restore the contents of `config.xml` from git or the original, and delete the '.original' file.
- The webpack dev server writes a `.devserver` file on startup, which is removed when it exits. The file is used by the cordova dev build; it should contain the LAN URL of the running dev server.
- Apple sillicon users may encounter a node-sass runtime error: `(mach-o file, but is an incompatible architecture (have 'x86_64', need 'arm64'))`, you can fix this by rebuilding node-sass for your platform:

```
npm rebuild node-sass
```

### Dev tools

Electron supports [extensions to Chrome devtools](https://electronjs.org/docs/tutorial/devtools-extension) such as Redux DevTools.

In the development environment, these will be loaded if you provide one or more paths to your extensions (semicolon-separated) in the `NC_DEVTOOLS_EXTENSION_PATH` environment variable. The electron docs describe how to find the filepath for an extension once installed.

Example: enabling Redux Devtools on macOS:
```bash
NC_DEVTOOLS_EXTENSION_PATH=~/Library/Application\ Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.15.2_0 npm run electron:dev
```

## Application Structure

```
.
├── config                   # Project and build configurations (webpack, env config)
├── public                   # Static public assets
│   └── index.html           # Static entry point
├── src                      # Application source code
│   ├── index.js             # Application bootstrap and rendering
│   ├── routes.js            # App Route Definitions
│   ├── components           # Contains directories for components
│   ├── containers           # Contains directories for containers for native and base classes
│   ├── ducks                # Middleware, modules (ducks-style with actions, reducers, and action creators), and store
│   └── utils                # Helpers and utils
├── www                      # Build output from webpack
```
