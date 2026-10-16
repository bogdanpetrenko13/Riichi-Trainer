// Runs tests/**/*.test.ts with Node's built-in test runner: each file is
// bundled by esbuild (TypeScript + JSX, app code imported as is) into
// .test-build and then run with `node --test`.
import { build } from "esbuild";
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const OUT = ".test-build";
const filter = process.argv[2];

function find(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? find(p) : p.endsWith(".test.ts") ? [p] : [];
  });
}

const files = find("tests").filter((f) => !filter || f.includes(filter));
if (!files.length) {
  console.error("no test files");
  process.exit(1);
}
rmSync(OUT, { recursive: true, force: true });
await build({
  entryPoints: files,
  outdir: OUT,
  outbase: "tests",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  packages: "external",
  jsx: "automatic",
  loader: { ".js": "jsx", ".png": "empty", ".svg": "empty", ".css": "empty" },
  define: { __APP_VERSION__: '"test"' },
  logLevel: "warning",
});
const outs = files.map((f) => join(OUT, f.slice("tests/".length).replace(/\.ts$/, ".mjs")));
const r = spawnSync(process.execPath, ["--test", ...outs], { stdio: "inherit" });
process.exit(r.status ?? 1);
