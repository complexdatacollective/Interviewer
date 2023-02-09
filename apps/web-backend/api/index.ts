
import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { protocolRouter } from './routes/protocol.ts';

export const apiRouter = new Router();

apiRouter
  .get("/protocols", protocolRouter.routes())
  .get("/health", (ctx) => {
    ctx.response.body = {
      status: "success",
    }
  });

