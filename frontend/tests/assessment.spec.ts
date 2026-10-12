import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

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
