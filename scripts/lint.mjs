#!/usr/bin/env node
/**
 * Lightweight lint for the static coming-soon page.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
let errors = 0;

function err(message) {
  console.error(`lint error: ${message}`);
  errors += 1;
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

if (!existsSync(publicDir)) err("public/ directory missing");

const htmlPath = join(publicDir, "index.html");
if (!existsSync(htmlPath)) {
  err("public/index.html missing");
} else {
  const html = readFileSync(htmlPath, "utf8");
  if (!html.includes("<!DOCTYPE html>")) err("index.html missing DOCTYPE");
  if (!html.includes('lang="en"')) err('index.html should set lang="en"');
  if (!html.includes("<title>")) err("index.html missing <title>");
  if (!html.includes('name="viewport"')) err("index.html missing viewport meta");
  if (html.includes("Spice Garden") || html.includes("spice garden")) {
    err("must not mention Spice Garden");
  }
  if (!/192 ELM PARK AVENUE/.test(html)) err("missing exact street address");
  if (!/HORNCHURCH · RM12 4SD/.test(html)) err("missing exact town/postcode line");

  const srcAttrs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const src of srcAttrs) {
    if (/^https?:\/\//.test(src) || src.startsWith("data:") || src.startsWith("#")) continue;
    const filePath = join(publicDir, src);
    if (!existsSync(filePath)) err(`broken local reference: ${src}`);
  }
}

const cssPath = join(publicDir, "css/styles.css");
if (!existsSync(cssPath)) {
  err("public/css/styles.css missing");
} else {
  const css = readFileSync(cssPath, "utf8");
  if (!css.includes(":root")) err("styles.css missing :root tokens");
  if (!css.includes("@media")) err("styles.css missing responsive media queries");
}

const jsPath = join(publicDir, "js/main.js");
if (!existsSync(jsPath)) {
  err("public/js/main.js missing");
} else {
  const js = readFileSync(jsPath, "utf8");
  try {
    // Syntax check via Function constructor for classic script
    // eslint-disable-next-line no-new-func
    new Function(js);
  } catch (e) {
    err(`js/main.js syntax error: ${e.message}`);
  }
}

const files = existsSync(publicDir) ? walk(publicDir) : [];
for (const path of files) {
  const rel = relative(root, path);
  if (/\.(env|pem|key)$/i.test(rel) || /secret|credential|token/i.test(rel)) {
    err(`possible secret file in publish tree: ${rel}`);
  }
}

if (errors > 0) {
  console.error(`lint failed with ${errors} error(s)`);
  process.exit(1);
}

console.log("lint ok");
