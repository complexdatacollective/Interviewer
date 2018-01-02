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

As a convinience, the repository contains configuration files that support the use of both `nvm` and `nodenv`. If you use either of these environment/version managers, you can install the correct node and npm versions automatically. For nvm, you can type `nvm use` from within the project directory. For nodenv, the command is `nodenv install`. Please refer to the documentation for these projects for further information.

## Installation

0. Install the correct node and npm versions.
1. Clone this repsitory.
2. Enter the directory where the repository is cloned, and install the project dependencies by typing `npm install`.
3. Refer to the development tasks section below to learn how to test and build the app.

## Development Tasks

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
