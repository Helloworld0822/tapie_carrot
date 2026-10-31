import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const root = await mkdtemp(join(tmpdir(), "carrot-test-"));
const probe = createServer();
await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const base = `http://localhost:${port}`;
const server = spawn(process.execPath, ["server.mjs"], {
  env: {
    ...process.env,
    PORT: String(port),
    DATABASE_PATH: join(root, "test.sqlite"),
  },
  stdio: ["ignore", "ignore", "inherit"],
});
async function run(file) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [`tests/${file}.mjs`], {
      env: { ...process.env, TEST_BASE_URL: base },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${file} failed (${code})`)),
    );
  });
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if (
        (await fetch(base + "/sell", { signal: AbortSignal.timeout(1000) })).ok
      ) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Test server did not become ready");
  for (const name of ["api", "photos", "filters", "websocket"]) await run(name);
} finally {
  const stopped = new Promise((resolve) => server.once("exit", resolve));
  if (server.exitCode === null) {
    server.kill();
    const force = setTimeout(() => server.kill("SIGKILL"), 3000);
    await stopped;
    clearTimeout(force);
  }
  await rm(root, { recursive: true, force: true });
}
