# @codaco/network-exporters [![Build Status](https://travis-ci.org/codaco/network-exporters.svg?branch=master)](https://travis-ci.org/codaco/network-exporters)
Utility for exporting a Network Canvas interview session in either CSV or GraphML format.

## Notes

- Include typing: [see here]<https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-class-d-ts.html>
- Move filesystem stuff to a separate package. Perhaps a monorepo?
- removed tempDataPath and userDataPath, and appPath so we can drop Electron dependency. These can be provided by consumer.
- need to create an abstracted filesystem interface that can be passed to this module, with separate cordova and electron instances.
- remove archive functionality - defer to the consumer to decide what to do with encoded files. We will now return a list of paths
- Need to document events and options

## Usage

Designed to be used in a nodejs environment (not browser!). The intended scenario for Network Canvas use is:

 - ** Interviewer ** - Consumed by backend (node) Electron context, with functionality exposed via IPC. Filesystem provided will be a shim over `fs` or `fs-extra`.
 - ** Fresco ** - Consumed by API server (node) context, with functionality exposed via HTTP. Filesystem provided will be a shim over `fs` or `fs-extra`.

### Sample use

Something like this:

 ``` js
const FileExportManager = require('@codaco/network-exporters');
const Filesystem = require('./node-filesystem-shim');

const fileExportManager = new FileExportManager(Filesystem);

// Provides helper method to generate text that can be used in UI.
const infoForUser = fileExportManager.getSupportedFormats();

// Bind event handlers to the emitter
fieExportManager.on('progress', (progress) => {
  console.log(progress);
});

const job = fileExportManager.prepareExportJob(
  sessions, // Collection of NC session objects
  protocols, // Collection of NC protocol objects
  formats, // Array of onr or more of 'csv' or 'graphml'
  options, // Export options object, including things such as temp path, user path, etc.
);

await job.run();

 ```
