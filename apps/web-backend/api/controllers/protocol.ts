import { Context, FormDataFile, FormDataBody } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";
import { Protocol } from '../../../../packages/shared-consts/dist/index.d.ts';
import { validateProtocol } from '../../../../packages/protocol-utils/dist/index.js';
import demoProtocol from '../../data/test/protocol.json' assert { type: "json" };

// TODO: create a function to generate mock protocols
const protocols: Protocol[] = [
  demoProtocol,
]

export default {
  getAllProtocols: (ctx: Context) => {
    ctx.response.body = protocols;
  },
  getProtocolById: async () => { },
  updateProtocolById: async () => { },
  deleteProtocolById: () => { },
  createProtocol: async (context: Context) => {

    /**
     * The protocol file is added to context.state.formData.files by the upload middleware.
     * It can be identified by the name 'protocolFile'.
     * Each file entry has a filename which points to the temp file location.
     * The temp file is a zip file containing the protocol.json file and any assets.
     * 
     * Shape of context.state.formData.files:
     * [
     *  {
     *   filename: '/tmp/protocol-1234.netcanvas',
     *   content: undefined, // Because the file is not in memory
     *   contentType: 'application/octect-stream',
     *   name: 'protocolFile', // This is set when the FormData object is set in the redux-toolkit API slice
     *   filename: 'protocol.netcanvas',
     * }
     * ]
     */

    // 1. Locate the protocolFile entry in the files array
    const formData: FormDataBody = context.state.formData;
    const protocolFile = formData.files?.find((file: FormDataFile) => file.name === 'protocolFile');

    if (!protocolFile) {
      context.throw(400, 'Protocol file not found');
    }

    // 2. Unzip the protocol file
    const tempDir = await Deno.makeTempDir();
    const filename = protocolFile.filename;

    if (!filename) {
      context.throw(400, 'No filename provided for protocol file.');
    }

    await decompress(filename, tempDir);

    // 3. Read the protocol.json file
    const protocol = await Deno.readTextFile(`${tempDir}/protocol.json`);
    const protocolJSON: Protocol = JSON.parse(protocol);

    // TODO: validate the protocol
    console.log('Validating....');
    const result = validateProtocol(protocolJSON);
    console.log('Result: ', result);


    // TODO: save the protocol to the database

    // TODO: copy protocol assets to the assets directory

    // TODO: remove the temp dir

    context.response.status = 200;
    context.response.body = protocolJSON;
  },
};