import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const dist = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const index = join(dist, "index.html");

function report(rule, passed, message) {
  console.log(`${rule} ${passed ? "PASS" : "FAIL"}: ${message}`);
  if (!passed) process.exitCode = 1;
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

report("R1", existsSync(index), "dist/index.html exists");

const matches = existsSync(dist)
  ? files(dist).filter((path) => /akrivon/i.test(readFileSync(path).toString()))
  : [];
report("R2", existsSync(dist) && matches.length === 0,
  matches.length ? `retired branding found in ${matches.join(", ")}` : "no retired branding in dist");

const html = existsSync(index) ? readFileSync(index, "utf8") : "";
const entry = [...html.matchAll(/<script\b([^>]*)>/g)]
  .map((match) => match[1])
  .find((attributes) => /\btype=["']module["']/.test(attributes));
const source = entry?.match(/\bsrc=["']([^"']+)["']/)?.[1];
const script = source ? resolve(dist, `.${source.startsWith("/") ? source : `/${source}`}`) : null;

if (!script || !script.startsWith(`${dist}${sep}`) || !existsSync(script)) {
  report("R3", false, "entry module referenced by dist/index.html must exist inside dist");
} else {
  const size = gzipSync(readFileSync(script)).length;
  report("R3", size < 130 * 1024, `entry script is ${(size / 1024).toFixed(2)} KB gzip, must be under 130 KB`);
}
