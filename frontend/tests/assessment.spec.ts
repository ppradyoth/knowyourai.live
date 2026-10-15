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

test("guide drafts prerender with evidence, code and review boundaries", async ({ page, request, context }, testInfo) => {
  const route = "/guide/controls/tool-argument-validation";
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match|server HTML/i.test(message.text())) errors.push(message.text());
  });
  for (const path of ["/guide", "/guide/stage/before-first-users", route]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
    if (path !== "/guide") expect(html).toContain('<meta name="robots" content="noindex">');
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const llms = await (await request.get("/llms.txt")).text();
  const full = await (await request.get("/llms-full.txt")).text();
  expect(sitemap).not.toContain(route);
  expect(llms).not.toContain(route);
  expect(full).not.toContain("Validate every tool call on the server");
  expect(existsSync(`${process.env.ASSESSMENT_FRONTEND_DIR}/dist${route}.md`)).toBe(false);
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "Validate every tool call on the server", exact: true })).toBeVisible();
  await expect(page.getByText("Draft, not yet reviewed", { exact: false }).first()).toBeVisible();
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
