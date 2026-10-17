import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { parse } from "yaml";
import { publicRoutes, appShellRoutes, caseStudies, studies, toolStages, getControls } from "../dist-ssr/entry-server.js";

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

const contentRoot = fileURLToPath(new URL("../content/", import.meta.url));
const content = files(contentRoot).filter((file) => file.endsWith(".md")).map((file) => {
  const raw = readFileSync(file, "utf8");
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${file}: YAML frontmatter is required`);
  return { file, raw, slug: file.split(sep).pop().replace(/\.md$/, ""), kind: file.split(sep).at(-2), meta: parse(frontmatter[1]), body: raw.slice(frontmatter[0].length).trim() };
});
const controls = content.filter((item) => item.kind === "controls");
const stageSlugs = ["one-hour-baseline", "before-first-users", "before-first-customer", "before-first-enterprise-deal", "running-it"];
const buildSlugs = ["chatbot", "rag", "tool-calling-agent", "mcp-server", "coding-agent-workflow", "agent-with-memory", "llm-judge", "local-models"];
const caseTargets = {
  "jack-and-jill": "Jack & Jill AI", "notion-ai": "Notion AI", "priceline-penny": "Priceline (Penny)",
  "brave-leo": "Brave Leo", "meta-ai-whatsapp": "Meta AI (WhatsApp)", "claude-code": "Anthropic Claude Code",
  "reddit-answers": "Reddit Answers", "harvey-labs": "Harvey Labs", "hackerone-hai": "HackerOne Hai",
  "codeant-ai-benchmark": "CodeAnt AI benchmark", "food-delivery-chatbot": "Food delivery chatbot",
};
const toolSlugs = toolStages.flatMap((stage) => stage.tools.map((tool) => tool.slug));
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isList = (value) => Array.isArray(value) && value.every(isText);
const invalidControls = controls.flatMap(({ file, meta: value }) => {
  const problems = ["title", "description", "stage", "time", "checklist", "agent_rule", "updated"].filter((field) => !isText(value[field])).map((field) => `${field} is required`);
  if (!["pending", "reviewed"].includes(value.review)) problems.push("invalid review");
  if (!stageSlugs.includes(value.stage)) problems.push("invalid stage");
  if (!isList(value.builds) || !value.builds.length || value.builds.some((slug) => !buildSlugs.includes(slug))) problems.push("invalid builds");
  if (value.tools !== undefined && (!isList(value.tools) || value.tools.some((slug) => !toolSlugs.includes(slug)))) problems.push("invalid tools");
  if (value.owasp !== undefined && !isList(value.owasp)) problems.push("invalid owasp");
  if (value.case !== undefined && !Object.hasOwn(caseTargets, value.case)) problems.push("invalid case");
  return problems.map((problem) => `${file}: ${problem}`);
});
report("R13", invalidControls.length === 0, invalidControls.length ? invalidControls.join("; ") : `${controls.length} controls have required fields and valid references`);

const configOnlyControls = ["agent-config-lint", "vet-skills-mcp", "model-provenance", "threat-model", "incident-playbook"];
const sectionProblems = controls.flatMap(({ file, slug, meta: value, body }) => {
  const expected = ["The risk", ...(value.case ? ["What happened in production"] : []), "The fix", "Prove it works", "Know the limit"];
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
  const problems = headings.join("|") === expected.join("|") ? [] : ["incorrect H2 sections or order"];
  const fix = body.split("## The fix\n")[1]?.split("\n## ")[0] ?? "";
  const languages = [...fix.matchAll(/^```([^\n]*)\n[\s\S]*?^```[ \t]*$/gm)].map((match) => match[1].trim());
  const code = languages.filter((language) => language === "ts").length === 1 && languages.filter((language) => language === "python").length === 1;
  if (!code && !(configOnlyControls.includes(slug) && languages.some((language) => ["json", "bash"].includes(language)))) problems.push("The fix needs one ts and one python block, or allowed config fences");
  return problems.map((problem) => `${file}: ${problem}`);
});
report("R14", sectionProblems.length === 0, sectionProblems.length ? sectionProblems.join("; ") : "control sections and fix code fences match the content model");

const withoutCode = (body) => body.replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, "");
const lengthProblems = controls.flatMap(({ file, body }) => {
  const count = withoutCode(body).trim().split(/\s+/).length;
  return count < 250 || count > 900 ? [`${file}: ${count} words, expected 250–900`] : [];
});
report("R15", lengthProblems.length === 0, lengthProblems.length ? lengthProblems.join("; ") : "control prose is 250–900 words excluding code");

const banned = /\b(revolutionary|robust|seamless|comprehensive|cutting-edge|game-changing|leverage|prevents prompt injection)\b/i;
const bannedWords = content.flatMap(({ file, raw }) => banned.test(raw) ? [`${file}: ${raw.match(banned)[0]}`] : []);
report("R16", bannedWords.length === 0, bannedWords.length ? bannedWords.join("; ") : "content contains no banned words");

const unknownControls = content.filter((item) => item.kind === "builds").flatMap(({ file, meta: value }) =>
  !isList(value.controls) ? [`${file}: controls must be a list`] : value.controls.filter((slug) => !controls.some((control) => control.slug === slug)).map((slug) => `${file}: unknown control ${slug}`));
report("R17", unknownControls.length === 0, unknownControls.length ? unknownControls.join("; ") : "every build control reference exists");

const caseNames = [...caseStudies, ...studies];
const copiedFacts = controls.flatMap(({ file, meta: value, body }) => caseNames.filter((item) => item.target !== caseTargets[value.case])
  .flatMap((item) => [item.brand, item.target].filter(Boolean)).filter((name) => body.toLowerCase().includes(name.toLowerCase())).map((name) => `${file}: contains another case name (${name})`));
report("R20", copiedFacts.length === 0, copiedFacts.length ? copiedFacts.join("; ") : "control bodies do not name unrelated cases");

const site = "https://knowyourai.live";
const isFile = (path) => existsSync(path) && statSync(path).isFile();
const isShell = (path) => appShellRoutes.some((route) => route.endsWith("/**")
  ? path === route.slice(0, -3) || path.startsWith(`${route.slice(0, -3)}/`) : path === route);
const brokenLinks = files(dist).filter((file) => file.endsWith(".html")).flatMap((file) => {
  const route = file.slice(dist.length).replace(/\.html$/, "").replace(/\/index$/, "/");
  const html = readFileSync(file, "utf8");
  return [...html.matchAll(/<a\b[^>]*>/gi)].flatMap(([tag]) => {
    const href = decode(attribute(tag, "href"));
    if (!href) return [];
    const url = new URL(href, `${site}${route}`);
    if (url.origin !== site) return [];
    const path = decodeURIComponent(url.pathname).replace(/\/$/, "") || "/";
    if (isShell(path) || /^\/(ctf|api)(\/|$)/.test(path)) return [];
    const target = join(dist, path === "/" ? "index.html" : path.slice(1));
    return isFile(target) || isFile(`${target}.html`) ? [] : [`${file}: ${href}`];
  });
});
report("R18", brokenLinks.length === 0, brokenLinks.length ? brokenLinks.join("; ") : "all internal links resolve to files or allowed app, CTF and API routes");

const expectedRules = getControls().filter((item) => item.meta.review === "reviewed")
  .map((item) => `- ${item.meta.agent_rule.replace(/\s+/g, " ").trim()} (${site}/guide/controls/${item.slug})`).sort();
const invalidAgentFiles = ["AGENTS.md", "SKILL.md", "knowyourai.mdc"].filter((name) => {
  const path = join(dist, "agent", name);
  if (!isFile(path)) return true;
  const text = readFileSync(path, "utf8");
  const rules = text.split("\n").filter((line) => line.startsWith("- ")).sort();
  if (!text.includes("# AI safety rules (knowyourai.live)") || rules.length !== expectedRules.length || rules.some((line, index) => line !== expectedRules[index])) return true;
  if (name === "AGENTS.md") return false;
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) return true;
  const value = parse(frontmatter[1]);
  return !isText(value.description) || (name === "SKILL.md" ? value.name !== "knowyourai-safe-ai" : typeof value.alwaysApply !== "boolean");
});
report("R19", invalidAgentFiles.length === 0, invalidAgentFiles.length ? `invalid agent files: ${invalidAgentFiles.join(", ")}` : `three agent files contain exactly ${expectedRules.length} reviewed control rules each`);
