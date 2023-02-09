import { Application, Router, proxy } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { apiRouter } from "./api/index.ts";

const PORT = 3001;

const app = new Application();
const router = new Router();

app.use(oakCors());

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Middleware for artificial delay (for testing)
app.use(async (_ctx, next) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await next();
});

router.get("/api", apiRouter.routes())
app.use(router.routes());

// Host frontend react app - not working rn.
const frontend = new Router();
frontend.get("/", proxy('http://localhost:3000'));
app.use(frontend.routes());

app.addEventListener("listen", ({ port, secure }) => {
  console.log(
    `🚀 Fresco started on ${secure ? "https://" : "http://"}localhost:${port}`
  );
});

// https/2 won't work without https (duh).
await app.listen({ port: PORT, alpnProtocols: ["h2", "http/1.1"] });