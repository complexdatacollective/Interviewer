// Capacitor live-reload dev runner.
//
// Starts the Vite dev server first, reads the port it actually bound, and only
// then points Capacitor at that URL and deploys. Because the native app is
// synced to Vite's real port, nothing is hardcoded and a busy port is a
// non-event — Vite just picks the next free one. cap run exits after deploying,
// so Vite is kept serving (for live reload) until the process is interrupted.
//
// Usage: node scripts/cap-dev.mjs <ios|android> [extra cap run args...]
import { execFileSync, spawn } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { createServer } from 'vite';

const platform = process.argv[2];
if (platform !== 'ios' && platform !== 'android') {
  console.error('usage: node scripts/cap-dev.mjs <ios|android> [cap run args]');
  process.exit(1);
}

const UDID = /^[0-9A-F]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}$/i;

// A --target simulator NAME can match several iOS simulators (e.g. duplicate
// "iPad Pro 13-inch (M5)" runtimes), which cap run can't disambiguate. Resolve
// a name to the first matching available UDID. UDIDs and Android AVD names (cap
// resolves those itself) pass through untouched.
const resolveTarget = (args) => {
  const flag = args.indexOf('--target');
  const wanted = flag === -1 ? null : args[flag + 1];
  if (platform !== 'ios' || !wanted || UDID.test(wanted)) {
    return args;
  }

  const { devices } = JSON.parse(
    execFileSync('xcrun', [
      'simctl',
      'list',
      'devices',
      'available',
      '--json',
    ]).toString(),
  );
  const match = Object.values(devices)
    .flat()
    .find((device) => device.name === wanted);
  if (!match) {
    console.error(`[cap-dev] no available simulator named "${wanted}"`);
    process.exit(1);
  }

  console.log(`[cap-dev] iOS target "${wanted}" → ${match.udid}`);
  const resolved = [...args];
  resolved[flag + 1] = match.udid;
  return resolved;
};

const runArgs = resolveTarget(process.argv.slice(3));

// The Android emulator reaches the host loopback via 10.0.2.2; the iOS
// simulator shares the host loopback directly, so localhost works there.
const host = platform === 'android' ? '10.0.2.2' : 'localhost';

const server = await createServer({
  configFile: fileURLToPath(new URL('../vite.web.config.js', import.meta.url)),
});
await server.listen();

const address = server.httpServer?.address();
const port = address && typeof address === 'object' ? address.port : null;
if (!port) {
  console.error('[cap-dev] could not determine the Vite dev server port');
  await server.close();
  process.exit(1);
}

const url = `http://${host}:${port}`;
console.log(`\n[cap-dev] Vite listening on :${port}`);
console.log(`[cap-dev] Capacitor will load ${url}\n`);

const env = { ...process.env, CAP_DEV_SERVER_URL: url };

const runCap = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'cap', ...args], {
      stdio: 'inherit',
      env,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`cap ${args.join(' ')} exited with code ${code}`)),
    );
  });

const shutdown = (code) => {
  server.close().finally(() => process.exit(code));
};
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

try {
  await runCap(['sync', platform]);
  await runCap(['run', platform, ...runArgs]);
} catch (error) {
  console.error(`[cap-dev] ${error.message}`);
  shutdown(1);
}

// cap run has exited; the open Vite server keeps this process alive for live
// reload until the user interrupts it.
console.log(
  '\n[cap-dev] Deployed. Vite is still serving for live reload — press Ctrl-C to stop.\n',
);
