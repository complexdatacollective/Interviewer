# Network Canvas [![Build Status](https://travis-ci.org/codaco/Network-Canvas.svg?branch=master)](https://travis-ci.org/codaco/Network-Canvas) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcodaco%2FNetwork-Canvas.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcodaco%2FNetwork-Canvas?ref=badge_shield)

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

This project currently requires version `8.9.3` of node, and version `5.5.1` of npm. These are the only supported versions for this project.

As a convenience, the repository contains configuration files that support the use of both `nvm` and `nodenv`. If you use either of these environment/version managers, you can install the correct node and npm versions automatically. For nvm, you can type `nvm use` from within the project directory. For nodenv, the command is `nodenv install`. Please refer to the documentation for these projects for further information.

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
node-gyp rebuild --target=1.8.2 --arch=x64 --dist-url=https://atom.io/download/electron
```

`target` must match the electron version installed by npm

### Troubleshooting

- Native dependencies won't compile
  + `windows-build-tools` should have installed the required compilers
  + [MS notes on config for native modules](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules)
  + ...You could install python and VS Build Tools manually; you should *not* need all of Visual Studio
- Runtime error related to DLL initialization
  + Make sure the "rebuild" step above works
  + [More Info](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md#using-native-node-modules)

## Installation

0. Install the correct node and npm versions.
1. Clone this repsitory.
2. Fetch submodules by typing `git submodule update --init`.
3. Enter the directory where the repository is cloned, and install the project dependencies by typing `npm install`.
4. Refer to the development tasks section below to learn how to test and build the app.

## Development Tasks

|`npm run <script>`|Description|
|------------------|-----------|
|`start`|Serves your app at `localhost:3000`.|
|`build`|Compiles assets and prepares app for production in the /build directory.|
|`test`|Runs testing suite.|
|`build-docs`|Builds HTML API docs into the docs-build directory.|
|`electron`|Runs the current code in electron, for testing.|
|`generate-icons`|Uses icon-gen package to generate iconsets and icon files for OSX and Windows.|
|`dev:android`|Run a live-reloading build of the Android app. Requires dev server to be running.|
|`dev:ios`|Run a live-reloading build of the iOS app. Requires dev server to be running.|
|`dist:mac`|Uses electron-packager to package an OSX release.|
|`dist:win`|Uses electron-packager to package a Windows release.|
|`dist:ios`|Builds iOS cordova project|
|`dist:android`|Builds Android cordova project|
|`dist:cordova`|Builds Android and iOS cordova projects|
|`create-installer-mac`|Creates a DMG based installer for OSX.|

## Cordova Builds

1. Install [cordova](https://cordova.apache.org) on your system: `npm install -g cordova`
2. If you haven't already, build the project: `npm run build`
  - Without the `www/` directory, cordova commands won't recognize this as a valid project.
3. Install platforms and plugins for the project: `cordova prepare`

See Cordova's [iOS docs](http://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html) and [Android docs](http://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) for requirements, configuration, and deploy instructions.

### Local Development & Testing

If you have a running webpack dev server (started with `npm start`), you can run dev cordova builds on devices & emulators with live reloading.

Run `npm run dev:[android|ios]`. This is a thin wrapper around `cordova run [android|ios]`; you can pass arguments to the cordova script with an extra pair of dashes. For example: `npm run dev:android -- --emulator`, or `npm run dev:ios -- --target="iPad-Pro, 11.2"`. Changes will be picked up from the dev server.

Troubleshooting:

- If a dev cordova build is interrupted, you may find that `config.xml` has changes, and that there's a `config.xml.original` file (ignored by git). You may restore the contents of `config.xml` from git or the original, and delete the '.original' file.
- The webpack dev server writes a `.devserver` file on startup, which is removed when it exits. The file is used by the cordova dev build; it should contain the LAN URL of the running dev server.

## Application Structure

```
.
├── build                    # Prod assets
├── config                   # Project and build configurations (webpack, env config)
├── public                   # Static public assets
│   └── index.html           # Static entry point
├── src                      # Application source code
│   ├── index.js             # Application bootstrap and rendering
│   ├── routes.js            # App Route Definitions
│   ├── components           # Contains directories for components
│   ├── containers           # Contains directories for containers for native and base classes
│   ├── reducers             # Reducers for data stores
│   ├── ducks                # Middleware, modules (ducks-style with actions, reducers, and action creators), and store
│   └── utils                # Helpers and utils
```
