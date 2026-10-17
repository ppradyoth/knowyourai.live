import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publicRoutes, render, getControls, getStages, getBuilds, getPosts } from "../dist-ssr/entry-server.js";

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
const records = [];

for (const route of publicRoutes()) {
  const result = route === "/" ? root : await page(route);
  const path = join(dist, route === "/" ? "index.html" : `${route.slice(1)}.html`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, template.replace("<!--head-->", () => head(result.seo))
    .replace('<div id="root"></div>', () => `<div id="root">${result.html}</div>`));
  records.push({ route, ...result.seo });
  console.log(`Prerendered ${route}`);
}

const notFound = await page("/__404__");
writeFileSync(join(dist, "404.html"), template.replace("<!--head-->", () => head({ ...notFound.seo, noindex: true }))
  .replace('<div id="root"></div>', () => `<div id="root">${notFound.html}</div>`));

const indexable = records.filter((record) => !record.noindex);
const content = new Map([
  ...getControls().map((item) => [`/guide/controls/${item.slug}`, item]),
  ...getStages().map((item) => [`/guide/stage/${item.slug}`, item]),
  ...getBuilds().map((item) => [`/guide/build/${item.slug}`, item]),
  ...getPosts().map((item) => [`/blog/${item.slug}`, item]),
]);
const reviewedGuide = [...content].filter(([route, item]) => route.startsWith("/guide/") && item.meta.review === "reviewed");
for (const [route, item] of reviewedGuide) {
  const path = join(dist, `${route.slice(1)}.md`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `# ${item.meta.title}\n\n${item.body}\n`);
}
writeFileSync(join(dist, "llms-full.txt"), ["# KnowYourAI", ...reviewedGuide.map(([route, item]) =>
  `# ${item.meta.title}\n\nSource: ${site}${route}\n\n${item.body}`)].join("\n\n") + "\n");

const agentDirectory = join(dist, "agent");
mkdirSync(agentDirectory, { recursive: true });
const rules = getControls().filter((item) => item.meta.review === "reviewed")
  .map((item) => `- ${item.meta.agent_rule.replace(/\s+/g, " ").trim()} (${site}/guide/controls/${item.slug})`);
const agentBody = `# AI safety rules (knowyourai.live)\n\n${rules.join("\n")}\n`;
const agentDescription = "Use when building or reviewing LLM features, agents, RAG, tool calls and MCP servers.";
writeFileSync(join(agentDirectory, "AGENTS.md"), agentBody);
writeFileSync(join(agentDirectory, "SKILL.md"), `---\nname: knowyourai-safe-ai\ndescription: ${agentDescription}\n---\n\n${agentBody}`);
writeFileSync(join(agentDirectory, "knowyourai.mdc"), `---\ndescription: ${agentDescription}\nalwaysApply: false\n---\n\n${agentBody}`);
const urls = indexable.map((record) => {
  const updated = content.get(record.route)?.meta.updated;
  return `  <url><loc>${escape(`${site}${record.route}`)}</loc>${updated ? `<lastmod>${escape(updated)}</lastmod>` : ""}</url>`;
});
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

const sections = [
  ["Guide", (route) => route.startsWith("/guide") || ["/checklist", "/agent"].includes(route)],
  ["Tools", (route) => route.startsWith("/tools") || ["/intentscan", "/enforce"].includes(route)],
  ["Research", (route) => route.startsWith("/case-studies") || route.startsWith("/blog") || route === "/research"],
];
const markdownTitle = (value) => value.replace(/[\[\]]/g, "\\$&");
writeFileSync(join(dist, "llms.txt"), [
  "# KnowYourAI",
  "Ship your AI product safely. The guide for teams with no security team.",
  ...sections.map(([title, includes]) => `## ${title}\n\n${indexable.filter((record) => includes(record.route))
    .map((record) => `- [${markdownTitle(record.title)}](${site}${record.route}): ${record.description}`).join("\n")}`),
].join("\n\n") + "\n");
