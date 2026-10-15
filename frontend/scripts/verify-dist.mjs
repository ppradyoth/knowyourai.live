import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { publicRoutes } from "../dist-ssr/entry-server.js";

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

const routes = publicRoutes();
const routeFile = (route) => join(dist, route === "/" ? "index.html" : `${route.slice(1)}.html`);
const missing = routes.filter((route) => !existsSync(routeFile(route)));
report("R4", missing.length === 0, missing.length ? `missing public pages: ${missing.join(", ")}` : `${routes.length} public route files exist`);

const decode = (value) => value.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ({
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
})[entity]);
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";

function meta(html, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].find(([tag]) => attribute(tag, "name") === name)?.[0];
  return tag ? decode(attribute(tag, "content")) : "";
}

const pages = routes.filter((route) => existsSync(routeFile(route))).map((route) => {
  const html = readFileSync(routeFile(route), "utf8");
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].find(([tag]) => attribute(tag, "rel") === "canonical")?.[0];
  return { route, html, title, description: meta(html, "description"), canonical: canonical ? decode(attribute(canonical, "href")) : "" };
});

const invalid = pages.flatMap((page) => {
  const problems = [];
  if ((page.html.match(/<h1\b/gi) ?? []).length !== 1) problems.push("exactly one h1 required");
  if (!page.title.trim()) problems.push("empty title");
  if (page.description.length < 50 || page.description.length > 160) problems.push(`description length ${page.description.length}, expected 50–160`);
  if (page.canonical !== `https://knowyourai.live${page.route}`) problems.push("canonical does not match route");
  return problems.map((problem) => `${page.route}: ${problem}`);
});
report("R5", invalid.length === 0, invalid.length ? invalid.join("; ") : "public pages have one h1 and valid title, description and canonical");

const duplicates = ["title", "description"].flatMap((field) => pages
  .filter((page, index) => pages.findIndex((other) => other[field] === page[field]) !== index)
  .map((page) => `${page.route}: duplicate ${field}`));
report("R6", duplicates.length === 0, duplicates.length ? duplicates.join("; ") : "all public titles and descriptions are unique");

const shells = ["404.html", "app.html"].filter((name) => !existsSync(join(dist, name))
  || !meta(readFileSync(join(dist, name), "utf8"), "robots").split(/,\s*/).includes("noindex"));
report("R7", shells.length === 0, shells.length ? `missing noindex page: ${shells.join(", ")}` : "404.html and app.html exist with noindex");

const empty = pages.filter((page) => !page.html.includes('<div id="root">') || /<div id="root">\s*<\/div>/.test(page.html));
report("R8", empty.length === 0, empty.length ? `empty public root: ${empty.map((page) => page.route).join(", ")}` : "every public root contains prerendered content");

const sitemap = join(dist, "sitemap.xml");
const listed = existsSync(sitemap) ? [...readFileSync(sitemap, "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1])).sort() : [];
const expected = pages.filter((page) => !meta(page.html, "robots").split(/,\s*/).includes("noindex"))
  .map((page) => `https://knowyourai.live${page.route}`).sort();
report("R9", existsSync(sitemap) && listed.length === expected.length && listed.every((url, index) => url === expected[index]),
  "sitemap.xml lists exactly the indexable public routes");

const llms = join(dist, "llms.txt");
report("R10", existsSync(llms) && readFileSync(llms, "utf8").startsWith("# KnowYourAI\n"), "llms.txt starts with # KnowYourAI");

const image = join(dist, "og-image.png");
report("R11", existsSync(image) && statSync(image).size > 5 * 1024, "og-image.png exists and is larger than 5 KB");

const reviewedGuide = pages.filter((page) => page.route.startsWith("/guide/") && !meta(page.html, "robots").split(/,\s*/).includes("noindex"));
const missingMarkdown = reviewedGuide.filter((page) => !existsSync(join(dist, `${page.route.slice(1)}.md`)));
report("R12", missingMarkdown.length === 0, missingMarkdown.length ? `missing markdown: ${missingMarkdown.map((page) => page.route).join(", ")}` : `${reviewedGuide.length} reviewed guide pages have markdown twins`);
