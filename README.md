# Network Canvas [![Build Status](https://travis-ci.org/codaco/Network-Canvas.svg?branch=master)](https://travis-ci.org/codaco/Network-Canvas)

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
## Installation
This repository assumes that `npm` is installed. If you don't have it installed, here are [installation instructions](https://docs.npmjs.com/getting-started/installing-node).

1. Clone this repo.
2. Go into the repo directory

|`npm run <script>`|Description|
|------------------|-----------|
|`start`|Serves your app at `localhost:3000`.|
|`build`|Compiles assets and prepares app for production in the /build directory.|
|`test`|Runs testing suite.|
|`build-docs`|Builds HTML API docs into the docs-build directory.|
|`electron`|Runs the current code in electron, for testing.|
|`generate-icons`|Uses icon-gen package to generate iconsets and icon files for OSX and Windows.|
|`package-mac`|Uses electron-packager to package an OSX release.|
|`package-win`|Uses electron-packager to package a Windows release.|
|`package-linux`|Uses electron-packager to package a Linux release.|
|`package-cordova`|Builds Android and iOS cordova projects|
|`create-installer-mac`|Creates a DMG based installer for OSX.|


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

# End to end tests 

## App

Currently OSX only, but could be setup to test Android.

### Setup

Install deps:

```sh
$ brew install carthage  # Cocoa dependency management (OSX only)
$ npm install
```

Ensure you have the following environment variables:

```sh
# Emulator testing
export END_TO_END_REMOTE=APPIUM
export END_TO_END_PLATFORM=IOS
```

### Run the tests

Run the web-driver server (automation layer for app):

```
$ npm run appium-server
```

Build the project (each time you want to test in-app changes):

```sh
$ npm run build
$ cordova build ios
```

Run the tests:
```sh
$ npm run test:end-to-end
```

# Browser

### Setup

Install deps:

```sh
$ npm install
$ npm run selenium-install.  # Install the requisite web drivers
```

Ensure you have the following environment variables:

```sh
export END_TO_END_REMOTE=BROWSER
export END_TO_END_PLATFORM=SAFARI
# or
export END_TO_END_REMOTE=BROWSER
export END_TO_END_PLATFORM=CHROME
```

### Run the tests

Run the web-driver server (automation layer for browsers):

```
$ npm run selenium-server
```

Run the dev server:

```sh
$ npm run start
```

Run the tests:
```sh
$ npm run test:end-to-end
```

