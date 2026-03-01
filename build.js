// Markup — Build Script
// Bundles the content script with its npm dependencies into dist/.
// All other extension files are copied as-is.
// Load Chrome unpacked from: dist/

const { build } = require("esbuild");
const { cpSync, mkdirSync, rmSync } = require("fs");
const { join } = require("path");

const SRC = join(__dirname, "src");
const DIST = join(__dirname, "dist");

async function run() {
  // Clean and recreate dist/
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(join(DIST, "content"), { recursive: true });
  mkdirSync(join(DIST, "sidebar"), { recursive: true });

  // Bundle content.js + css-selector-generator → single IIFE
  await build({
    entryPoints: [join(SRC, "content", "content.js")],
    bundle: true,
    outfile: join(DIST, "content", "content.js"),
    format: "iife",
    platform: "browser",
    target: ["chrome114"],
  });

  // Copy files that don't need bundling
  for (const file of ["manifest.json", "background.js"]) {
    cpSync(join(SRC, file), join(DIST, file));
  }
  cpSync(join(SRC, "sidebar"), join(DIST, "sidebar"), { recursive: true });

  console.log("Markup: build complete → dist/");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
