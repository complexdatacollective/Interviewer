import { unzip } from "fflate";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { CapacitorHttp } from '@capacitor/core';
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { checkSchemaVersion, filenameFromURI, protocolNameFromFilename } from "../shared/utils";
import { validateProtocol } from "../../parseProtocol";
import uuid from 'uuid/v4';
import { checkForUnexportedSessions, getExistingProtocolUid } from "../../checkExistingProtocol";
import { PROTOCOL_EXTENSION } from '~/config';
import { queue } from "async";
import { ImportManager } from "../shared/ImportManager";

export class CapacitorImportManager extends ImportManager {
  importFromURI = async (uri, callback) => {
    if (!uri) {
      throw new Error('No URI provided.');
    }

    this.emit('start');

    this.emit('update', {
      title: 'Downloading protocol...',
      progress: 5,
    })

    const name = filenameFromURI(uri);

    // This method is broken: https://github.com/ionic-team/capacitor/issues/6126
    // So we need to set response type to 'blob', but expect to receive a base64 string
    // We then need to convert this base64 string into a Uint8Array
    const { data } = await CapacitorHttp.get({
      url: uri,
      responseType: 'blob'
    });

    const file = new Uint8Array(atob(data).split('').map((c) => c.charCodeAt(0)));

    // Convert base64 string from FilePicker into Uint8Array using atob
    return this.importFromFile(file, name, callback);
  }

  chooseFile = async () => {
    // Choose a file from the device
    const { files } = await FilePicker.pickFiles({
      multiple: false,
      readData: true,
      extensions: [PROTOCOL_EXTENSION],
    });

    const data = files[0].data;
    const name = protocolNameFromFilename(files[0].name);

    // Convert base64 string from FilePicker into Uint8Array using atob
    const file = new Uint8Array(atob(data).split('').map((c) => c.charCodeAt(0)));

    return {
      file,
      name,
    }
  }


  importFromFile = async (fileData = null, protocolName = null, callback = null) => {
    let protocolUUID = uuid();

    this.emit('start');

    // if no file was provided, prompt the user to choose one
    if (!fileData) {
      const picker = await this.chooseFile();

      if (!picker) {
        throw new Error('No file chosen.');
      }

      fileData = picker.file;
      protocolName = picker.name;
    }

    this.emit('update', {
      title: 'Checking for existing protocol...',
      progress: 5,
    })

    // Check if a protocol with the same name already exists
    const existingProtocolUUID = getExistingProtocolUid(protocolName);

    // If it does, check if any unexported sessions are using it
    if (existingProtocolUUID) {
      // This will throw an error if there are unexported sessions, or otherwise
      // show a dialog asking the user if they want to overwrite the existing protocol
      await checkForUnexportedSessions(existingProtocolUUID);

      // todo: delete the existing protocol here.
      protocolUUID = existingProtocolUUID;
    }

    this.emit('update', {
      title: 'Reading ZIP file...',
      progress: 15,
    })

    // Use fflate to decompress the zip file
    const extractedFiles = await new Promise(async (resolve, reject) => {
      await unzip(fileData, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(files);
      });
    });

    console.log('extractedFiles', extractedFiles);

    const protocolFile = String.fromCharCode.apply(null, extractedFiles['protocol.json']);

    this.emit('update', {
      title: 'Validating protocol',
      progress: 20,
    })

    // Parse as json
    const protocolJson = JSON.parse(protocolFile);

    // Check schema version
    await checkSchemaVersion(protocolJson);

    // Validate protocol
    try {
      await validateProtocol(protocolJson);
    } catch (error) {
      // Look at what I did with the refactor to see how we might change this!

      cancelled = true;
      this.emit('error', error);
    }


    this.emit('update', {
      title: 'Copying protocol contents to device storage...',
      progress: 50,
    })

    const handler = async (key) => {
      console.log('Extracting file:', key);
      const file = extractedFiles[key]; // Uint8Array representing the file

      // If the file is empty, skip it
      if (file.length === 0) {
        console.log("Skipping empty file:", key)
        return;
      }

      console.info('Writing ', key);

      this.emit('update', {
        title: 'Copying protocol contents to device storage...Extracting ' + key + '...',
        progress: 70,
      })

      // Convert the Uint8Array to a base 64 encoded string
      const fileString = btoa(String.fromCharCode.apply(null, file));

      // Write the file to the cache directory
      await Filesystem.writeFile({
        path: `${protocolUUID}/${key}`,
        data: fileString,
        directory: Directory.Data,
        recursive: true,
      });

      return;
    }

    const q = queue(handler, 1);

    // Write each file to the cache directory
    Object.keys(extractedFiles).map(key => {
      console.log('Queing file for extraction:', key);
      q.push(key);
    })



    await q.drain();


    const protocolWithName = {
      ...protocolJson,
      name: protocolName,
    }

    this.emit('complete', protocolWithName);

    if (callback) {
      callback(protocolWithName);
    }

    // todo cleanup

  }
}
