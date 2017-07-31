# Network Canvas
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
