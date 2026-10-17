import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

test.beforeEach(async ({ page }) => {
  await page.goto("/assessment");
  await expect(page.getByRole("heading", { name: "Your context. Your assessment." })).toBeVisible();
});

test("guided inputs retain tool permissions, report context and trace roles", async ({ page }) => {
  await page.getByRole("button", { name: "Explore a synthetic example", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Billing assistant", exact: true })).toBeVisible();
  await page.getByLabel("Models, versions and routing", { exact: true }).fill("synthetic-model-v1");
  await page.getByRole("button", { name: "02 Actions & data", exact: true }).click();
  await page.locator("#tool-identity-0").selectOption("per_user");
  await page.getByRole("button", { name: "Add a tool", exact: true }).click();
  await page.locator("#tool-name-1").fill("lookup_invoice");
  await page.locator("#tool-effect-1").selectOption("read");
  await page.locator("#tool-approval-1").selectOption("none");
  await page.getByRole("button", { name: "03 Evidence", exact: true }).click();
  await page.locator("#tested-version-sample-report").fill("synthetic-fixture-v2");
  await page.locator("#finding-status-sample-report").selectOption("retest_pending");
  await page.getByRole("button", { name: /^Code & architecture/ }).click();
  await expect(page.locator("#role-sample-code")).toHaveValue("memory");
  await page.getByRole("button", { name: /^Conversations & traces/ }).click();
  await page.getByLabel("Role for new sources", { exact: true }).selectOption("tool_trace");
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-trace.json",
    mimeType: "application/json",
    buffer: Buffer.from('[{"type":"tool_call","name":"lookup_invoice","approval":"pending"}]'),
  });
  await expect(page.getByRole("button", { name: /^Conversations & traces/ })).toHaveText(/Conversations & traces\s*1/);
  await expect(page.getByLabel("What this source describes", { exact: true })).toHaveValue("tool_trace");
  await page.getByRole("button", { name: "04 Review", exact: true }).click();
  await expect(page.getByText("apply_correction, lookup_invoice", { exact: true })).toBeVisible();
  await expect(page.getByText("synthetic-model-v1", { exact: true })).toBeVisible();
  await expect(page.getByText("apply_correction: always; lookup_invoice: none", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Review evidence library", exact: true }).click();
  await page.getByRole("button", { name: /^Previous assessments/ }).click();
  await expect(page.locator("#tested-version-sample-report")).toHaveValue("synthetic-fixture-v2");
  await expect(page.locator("#finding-status-sample-report")).toHaveValue("retest_pending");
  await expect(page.getByText(/Inputs have changed/)).toBeVisible();
});

test("JSON and Markdown downloads preserve the assessment snapshot", async ({ page }) => {
  await page.getByRole("button", { name: "Explore a synthetic example", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Billing assistant", exact: true })).toBeVisible();
  await page.getByLabel("System name", { exact: true }).fill("Edited draft name");
  const jsonEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const jsonDownload = await jsonEvent;
  await jsonDownload.saveAs("test-results/example-assessment.json");
  const jsonPath = await jsonDownload.path();
  expect(jsonPath).not.toBeNull();
  const result = JSON.parse(await readFile(jsonPath!, "utf8"));
  expect(result.name).toBe("Billing assistant");
  expect(result.execution_status).toBe("not_run");
  expect(result.example).toBe(true);
  expect(result.context.application_type).toBe("multi_agent");
  expect(result.scope.context.tools[0].approval).toBe("always");
  expect(result.sources[0].role).toBe("business_rules");
  expect(result.sources[2].tested_version).toBe("Example fixture");
  expect(result.sources.every((source: { sha256: string; content?: string }) => /^[a-f0-9]{64}$/.test(source.sha256) && source.content === undefined)).toBe(true);
  const markdownEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown", exact: true }).click();
  const markdownDownload = await markdownEvent;
  await markdownDownload.saveAs("test-results/example-assessment.md");
  const markdownPath = await markdownDownload.path();
  expect(markdownPath).not.toBeNull();
  const markdown = await readFile(markdownPath!, "utf8");
  expect(markdown).toContain("Supplied system context");
  expect(markdown).toContain("Tools and permissions");
  expect(markdown).toContain("Finding / retest status: reported");
  expect(markdown).toContain("Tested version: Example fixture");
  expect(markdown).toContain("Tests have not been executed.");
});

test("input steps fit desktop and mobile in both themes", async ({ page }) => {
  await page.getByRole("button", { name: "Explore a synthetic example", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Billing assistant", exact: true })).toBeVisible();
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      const current = await page.locator("html").getAttribute("data-theme");
      if (current !== theme) await page.getByRole("button", { name: new RegExp(`Switch to ${theme} mode`) }).click();
      for (const step of ["01 System", "02 Actions & data", "03 Evidence", "04 Review"]) {
        await page.getByRole("button", { name: step, exact: true }).click();
        const dimensions = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
        expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
      }
      await page.getByRole("button", { name: "03 Evidence", exact: true }).click();
      await page.getByRole("link", { name: "Build an assessment", exact: true }).click();
      await page.screenshot({ path: `test-results/intake-${width}-${theme}.png`, animations: "disabled" });
    }
  }
});

test("empty and binary uploads give a readable error without adding a source", async ({ page }) => {
  await page.getByRole("button", { name: "03 Evidence", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "empty.md", mimeType: "text/plain", buffer: Buffer.from("   ") });
  await expect(page.getByRole("alert")).toContainText("does not contain readable text");
  await page.locator('input[type="file"]').setInputFiles({ name: "binary.py", mimeType: "text/plain", buffer: Buffer.from([0xff, 0xfe, 0x00]) });
  await expect(page.getByRole("alert")).toContainText("not UTF-8 text");
  await expect(page.getByRole("button", { name: /^Previous assessments/ })).toHaveText(/Previous assessments\s*0/);
});

test("client navigation updates page metadata and clears noindex", async ({ page }) => {
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page).toHaveTitle("Documentation | KnowYourAI");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://knowyourai.live/docs");
  await page.getByRole("link", { name: "Use Cases", exact: true }).click();
  await expect(page).toHaveTitle("Use Cases | KnowYourAI");
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Page not found | KnowYourAI");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page).toHaveTitle("Documentation | KnowYourAI");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
});

test("public HTML contains its content and hydrates without mismatches", async ({ page }) => {
  const response = await page.request.get("/tools");
  const html = await response.text();
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toContain("Every tool, what it proves, and where it stops");
  expect(html).not.toContain('<div id="root"></div>');
  const mismatches: string[] = [];
  const hydrationError = /hydration|hydrating|server HTML|Minified React error #(418|423|425)/i;
  page.on("pageerror", (error) => { if (hydrationError.test(error.message)) mismatches.push(error.message); });
  page.on("console", (message) => { if (message.type() === "error" && hydrationError.test(message.text())) mismatches.push(message.text()); });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page).toHaveTitle("Documentation | KnowYourAI");
  expect(mismatches).toEqual([]);
});

test("moved blog posts render and stay out of indexing while pending", async ({ page }) => {
  await page.goto("/blog");
  const posts = page.locator(".blog-card-title");
  await expect(posts).toHaveCount(4);
  const links = await page.locator(".blog-card-link").evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  const sitemap = await (await page.request.get("/sitemap.xml")).text();
  const llms = await (await page.request.get("/llms.txt")).text();
  for (const path of links) {
    const html = await (await page.request.get(path)).text();
    expect(html).toContain('content="noindex"');
    expect(html).not.toContain('<div id="root"></div>');
    expect(sitemap).not.toContain(`https://knowyourai.live${path}</loc>`);
    expect(llms).not.toContain(`https://knowyourai.live${path})`);
    await page.goto(path);
    await expect(page.locator(".blog-post-title")).toBeVisible();
    await expect(page.locator(".prose")).not.toBeEmpty();
  }
});

test("guide review status controls indexing, evidence and markdown", async ({ page, request, context }, testInfo) => {
  const route = "/guide/controls/tool-argument-validation";
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match|server HTML/i.test(message.text())) errors.push(message.text());
  });
  const source = await readFile(`${process.env.ASSESSMENT_FRONTEND_DIR}/content/controls/tool-argument-validation.md`, "utf8");
  const pending = /^review:\s*["']?pending["']?\s*$/m.test(source);
  for (const path of ["/guide", "/guide/stage/before-first-users", route]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
    if (path !== "/guide") {
      const file = path === route ? "controls/tool-argument-validation.md" : "stages/before-first-users.md";
      const text = await readFile(`${process.env.ASSESSMENT_FRONTEND_DIR}/content/${file}`, "utf8");
      const noindex = /^review:\s*["']?pending["']?\s*$/m.test(text);
      expect(html).toContain(`<meta name="robots" content="${noindex ? "noindex" : "index, follow"}">`);
    }
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const llms = await (await request.get("/llms.txt")).text();
  const full = await (await request.get("/llms-full.txt")).text();
  expect(sitemap.includes(route)).toBe(!pending);
  expect(llms.includes(route)).toBe(!pending);
  expect(full.includes(`Source: https://knowyourai.live${route}\n`)).toBe(!pending);
  expect(existsSync(`${process.env.ASSESSMENT_FRONTEND_DIR}/dist${route}.md`)).toBe(!pending);
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "Validate every tool call on the server", exact: true })).toBeVisible();
  await expect(page.getByText(pending ? "Draft, not yet reviewed" : "Last reviewed", { exact: false }).first()).toBeVisible();
  await expect(page.locator("#what-happened-in-production + .gd-case-excerpt")).toBeVisible();
  await expect(page.locator(".gd-code-language")).toHaveText(["ts", "python"]);
  const article = await page.locator('script[data-gd-seo]').allTextContents();
  expect(article.map((text) => JSON.parse(text)["@type"])).toEqual(["TechArticle", "BreadcrumbList"]);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const code = await page.locator(".gd-code-block pre").first().textContent();
  await page.locator(".gd-code-block").first().getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.locator(".gd-code-block").first().getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`guide-${theme}-${width}.png`), fullPage: true });
    }
  }
  for (const path of ["/guide/controls/missing-control", "/guide/stage/missing-stage", "/guide/build/missing-build"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("tool detail pages prerender their data and legacy fragments redirect", async ({ page, request }) => {
  await page.goto("/tools");
  const links = await page.locator(".tool-stage .card h3 a").evaluateAll((items) => items.map((item) => item.getAttribute("href")!));
  expect(links).toHaveLength(14);
  for (const path of links) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Know the limit");
    expect(html).toContain("Used in the guide");
    const schemas = [...html.matchAll(/<script type="application\/ld\+json" data-gd-seo>(.*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    expect(schemas.find((item) => item["@type"] === "SoftwareApplication")?.offers.price).toBe(0);
  }
  await page.goto("/tools#agentscan");
  await expect(page).toHaveURL(/\/tools\/agentscan$/);
  await expect(page.getByRole("heading", { level: 1, name: "agentscan", exact: true })).toBeVisible();
  await page.goto("/tools/missing-tool");
  await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
});

test("research pages retain full evidence and legacy case fragments", async ({ page, request }, testInfo) => {
  await page.goto("/case-studies");
  const links = await page.locator(".gd-research-listing .gd-research-title a").evaluateAll((items) => items.map((item) => item.getAttribute("href")!));
  expect(links).toHaveLength(11);
  for (const path of links) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("How to prevent this");
    expect(html).toContain("All work here was performed independently");
    expect(html).toContain("Know the limit");
    const schemas = [...html.matchAll(/<script type="application\/ld\+json" data-gd-seo>(.*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    expect(schemas.some((item) => item["@type"] === "Article")).toBe(true);
  }
  await page.goto("/case-studies#case-priceline-penny-");
  await expect(page).toHaveURL(/\/case-studies\/priceline-penny$/);
  await expect(page.getByRole("heading", { level: 1, name: "Priceline (Penny)", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Disclosure record", exact: true })).toBeVisible();
  await expect(page.getByText("No reservation, payment, or financial loss was demonstrated.", { exact: false })).toBeVisible();
  await page.goto("/case-studies/codeant-ai-benchmark");
  await expect(page.getByRole("heading", { name: "Evidence records", exact: true })).toBeVisible();
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; window.scrollTo(0, 0); }, theme);
      await expect(page.locator(".gd-research-page")).toHaveCSS("opacity", "1");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`research-${theme}-${width}.png`), fullPage: true, animations: "disabled" });
    }
  }
  await page.goto("/case-studies/missing-case");
  await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
});

test("hosted tool landings stay public and app navigation stays private", async ({ page, request }) => {
  for (const [path, name] of [["/intentscan", "IntentScan"], ["/enforce", "IntentEnforce"]]) {
    const html = await (await request.get(path)).text();
    expect(html).toContain('<meta name="robots" content="index, follow">');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(`href="/app${path}"`);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Open the app", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    const shell = await (await request.get(`/app${path}`)).text();
    expect(shell).toContain('<meta name="robots" content="noindex">');
    expect(shell).toContain('<div id="root"></div>');
  }
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/login$/);
});

test("checklist keeps selections, excludes drafts and fits both themes", async ({ page }, testInfo) => {
  await page.goto("/checklist");
  const builds = page.getByRole("group", { name: "What are you building?", exact: true });
  await expect(builds.getByRole("checkbox")).toHaveCount(8);
  await expect(page.getByRole("button", { name: "Before your first users", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Copy as markdown", exact: true })).toBeDisabled();
  await expect(page.getByText("No reviewed controls match this selection yet.", { exact: false })).toBeVisible();
  for (const checkbox of await builds.getByRole("checkbox").all()) {
    if (await checkbox.getAttribute("value") !== "chatbot") await checkbox.uncheck();
  }
  const chatbot = builds.getByRole("checkbox", { name: "A chatbot or support assistant", exact: true });
  await chatbot.click();
  await expect(chatbot).toBeChecked();
  await page.getByRole("button", { name: "Running it", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("knowyourai-checklist")!).stage)).toBe("running-it");
  await page.reload();
  await expect(page.getByRole("button", { name: "Running it", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(builds.locator('input:checked')).toHaveCount(1);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      await expect(page.locator(".gd-checklist")).toHaveCSS("opacity", "1");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`checklist-${theme}-${width}.png`), fullPage: true, animations: "disabled" });
    }
  }
});

test("checklist works when its browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "knowyourai-checklist") throw new DOMException("Storage unavailable");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "knowyourai-checklist") throw new DOMException("Storage unavailable");
      return set.call(this, key, value);
    };
  });
  const calls: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
  await page.goto("/checklist");
  await expect(page.getByRole("heading", { level: 1, name: "AI launch checklist", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Running it", exact: true }).click();
  await expect(page.getByRole("button", { name: "Running it", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(calls).toEqual([]);
});

test("agent downloads contain only the reviewed rules shown on the page", async ({ page, request }) => {
  await page.goto("/agent");
  await expect(page.getByRole("heading", { level: 1, name: "Give your coding agent the reviewed rules", exact: true })).toBeVisible();
  const files = await Promise.all(["AGENTS.md", "SKILL.md", "knowyourai.mdc"].map(async (name) => {
    const response = await request.get(`/agent/${name}`);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain("# AI safety rules (knowyourai.live)");
    return text.split("\n").filter((line) => line.startsWith("- "));
  }));
  expect(files[1]).toEqual(files[0]);
  expect(files[2]).toEqual(files[0]);
  await expect(page.locator(".gd-agent-rules li")).toHaveCount(files[0].length);
  await expect(page.locator(".gd-code-block")).toHaveCount(3);
  if (!files[0].length) await expect(page.getByText("No reviewed rules are available yet.", { exact: false })).toBeVisible();
});
