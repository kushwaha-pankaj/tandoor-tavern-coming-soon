#!/usr/bin/env node
/**
 * Static-site build gate for Cloudflare Pages.
 * Confirms required assets exist; output dir is public/.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const required = [
  "index.html",
  "css/styles.css",
  "js/main.js",
  "assets/tandoor-tavern-logo.jpeg",
  "assets/tandoor-tavern-background-hq.jpg",
  "assets/paisley-corner-left.png",
  "assets/paisley-corner-right.png",
];

const forbidden = ["Spice Garden", "spice garden", "SpiceGarden"];

function fail(message) {
  console.error(`build failed: ${message}`);
  process.exit(1);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

for (const rel of required) {
  const path = join(publicDir, rel);
  if (!existsSync(path)) fail(`missing required file: public/${rel}`);
  if (!statSync(path).isFile()) fail(`not a file: public/${rel}`);
  if (statSync(path).size < 32) fail(`file too small: public/${rel}`);
}

const html = readFileSync(join(publicDir, "index.html"), "utf8");
for (const term of forbidden) {
  if (html.includes(term)) fail(`forbidden reference found in index.html: ${term}`);
}

if (!html.includes("192 ELM PARK AVENUE")) {
  fail("exact address line missing: 192 ELM PARK AVENUE");
}
if (!html.includes("HORNCHURCH · RM12 4SD")) {
  fail("exact address line missing: HORNCHURCH · RM12 4SD");
}
if (!html.includes("assets/tandoor-tavern-logo.jpeg")) {
  fail("logo path must be assets/tandoor-tavern-logo.jpeg");
}
if (!html.includes("assets/tandoor-tavern-background-hq.jpg")) {
  fail("background path must be assets/tandoor-tavern-background-hq.jpg");
}

const logoPath = join(publicDir, "assets/tandoor-tavern-logo.jpeg");
const logoHash = sha256(logoPath);
console.log(`logo sha256: ${logoHash}`);
console.log("build ok — output directory: public/");

const stampDir = join(root, ".build");
mkdirSync(stampDir, { recursive: true });
copyFileSync(join(publicDir, "index.html"), join(stampDir, "index.html.check"));
console.log("checks passed");
