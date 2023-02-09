
import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { multipartUpload } from "../../middleware/multipart.ts";
import protocolController from '../controllers/protocol.ts';

export const protocolRouter = new Router();

protocolRouter
  .get("/", protocolController.getAllProtocols)
  .post("/", multipartUpload(), protocolController.createProtocol);
