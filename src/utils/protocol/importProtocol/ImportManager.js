import Zip from 'jszip';
import { Directory, Filesystem } from "@capacitor/filesystem";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import EventEmitter from "eventemitter3";
import { checkSchemaVersion } from "./shared/utils";
import { validateProtocol } from "../parseProtocol";
import uuid from 'uuid/v4';
import { checkForUnexportedSessions, getExistingProtocolUid } from "../checkExistingProtocol";
import { PROTOCOL_EXTENSION } from '~/config';

class ImportManager {
  constructor() {
    this.events = new EventEmitter();
  }

  on = (...args) => {
    this.events.on(...args);
  }

  emit(event, payload) {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn('Malformed emit.');
      return;
    }

    this.events.emit(event, payload);
  }

  removeAllListeners = () => {
    this.events.removeAllListeners();
  }
}


export class CapacitorImportManager extends ImportManager {
  begin = async () => {
    let protocolUUID = uuid();
    let cancelled = false;

    this.emit('start');

    // Choose a file from the device
    const { files } = await FilePicker.pickFiles({
      multiple: false,
      readData: true,
      extensions: [PROTOCOL_EXTENSION],
    });

    const { name, uri } = files[0];

    // Check if a protocol with the same name already exists
    const existingProtocolUUID = getExistingProtocolUid(name);

    // If it does, check if any unexported sessions are using it
    if (existingProtocolUUID) {
      // This will throw an error if there are unexported sessions, or otherwise
      // show a dialog asking the user if they want to overwrite the existing protocol
      await checkForUnexportedSessions(existingProtocolUUID);

      // todo: delete the existing protocol here.

      protocolUUID = existingProtocolUUID;
    }

    this.emit('update', {
      title: 'Copying to cache directory',
      progress: 10,
    })

    // Use JSZip to load the zip file
    const zip = new Zip();
    const { files: extractedFiles } = await zip.loadAsync(uri);

    // Extract the zip file to the cache directory
    await Promise.all(
      Object.keys(extractedFiles).map(async (path) => {
        const file = extractedFiles[path];
        const { dir, name } = file;
        const { data } = await file.async('uint8array');
        const filePath = `${dir}/${name}`;
        await Filesystem.writeFile({
          path: filePath,
          data,
          directory: Directory.Cache,
        });
      })
    );

    // Read the protocol.json from the extracted directory
    const protocol = await Filesystem.readFile({
      path: `protocol.json`,
      directory: Directory.Cache,
    });

    this.emit('update', {
      title: 'Validating protocol',
      progress: 20,
    })

    // Parse as json
    const protocolJson = JSON.parse(protocol);

    // Check schema version
    await checkSchemaVersion(protocolJson);

    // Validate protocol
    await validateProtocol(protocolJson);

    // Copy protocol to documents directory
    await Filesystem.copy({
      from: path,
      to: 'protocols',
      directory: Directory.Documents,
    });

    this.emit('complete', protocolJson);

    // todo cleanup

  }
}
