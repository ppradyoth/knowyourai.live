import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publicRoutes, render } from "../dist-ssr/entry-server.js";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const template = readFileSync(join(dist, "index.html"), "utf8");
const site = "https://knowyourai.live";
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function head(seo) {
  const url = `${site}${seo.path}`;
  return [
    `<title>${escape(seo.title)}</title>`,
    `<meta name="description" content="${escape(seo.description)}">`,
    `<link rel="canonical" href="${escape(url)}">`,
    `<meta property="og:title" content="${escape(seo.title)}">`,
    `<meta property="og:description" content="${escape(seo.description)}">`,
    `<meta property="og:url" content="${escape(url)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="KnowYourAI">',
    `<meta property="og:image" content="${site}/og-image.png">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="robots" content="${seo.noindex ? "noindex" : "index, follow"}">`,
    ...(seo.jsonLd ?? []).map((data) => `<script type="application/ld+json" data-gd-seo>${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`),
  ].join("\n");
}

async function page(route) {
  const result = await render(route).catch((error) => {
    throw new Error(`Prerender failed for ${route}`, { cause: error });
  });
  if (!result.seo) throw new Error(`Missing SEO metadata for ${route}`);
  return result;
}

if (!template.includes("<!--head-->") || !template.includes('<div id="root"></div>')) {
  throw new Error("The HTML template must contain <!--head--> and an empty #root");
}

const root = await page("/");
writeFileSync(join(dist, "app.html"), template.replace("<!--head-->", () => head({ ...root.seo, noindex: true })));

for (const route of publicRoutes()) {
  const result = route === "/" ? root : await page(route);
  const path = join(dist, route === "/" ? "index.html" : `${route.slice(1)}.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, template.replace("<!--head-->", () => head(result.seo))
    .replace('<div id="root"></div>', () => `<div id="root">${result.html}</div>`));
  console.log(`Prerendered ${route}`);
}

const notFound = await page("/__404__");
writeFileSync(join(dist, "404.html"), template.replace("<!--head-->", () => head({ ...notFound.seo, noindex: true }))
  .replace('<div id="root"></div>', () => `<div id="root">${notFound.html}</div>`));
