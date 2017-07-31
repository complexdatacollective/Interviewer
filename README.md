# Network Canvas Server

A data collection server for the Network Canvas app.

# Getting started

## Background

This application runs on Electron and consists of two parts, which correlate to Electron's main/rendering processes:

1. The UI, which contains the tray menu: `/#/tray`, and the configuration/export screens.
1. The Server, which receives data and adds it to a store.

### 1. The UI

The UI is a React app which runs in Electron's BrowserWindow().

The tray and main windows are separate instances, but run different paths on the same react app.

It is possible to test the UI by running `npm run start`, and viewing the various paths in your browser.

### 2. The server

The actual HTTP/Sockets server runs in a fork managed by the main process.

The main process itself acts a go-between for the UI and the server process.

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

## Running

To run the UI:

```sh
npm run start
```

To run the whole app (including server):

```sh
$ npm run build
$ npm run electron
```

## Application Structure

```
.
├── config                   # Project and build configurations (webpack, env config)
├── public                   # Static public assets & main process source (inc. server)
├── src                      # UI application source code
```
