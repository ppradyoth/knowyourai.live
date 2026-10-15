import { parse } from "yaml";

type BaseMeta = {
  title: string;
  description: string;
  review: "pending" | "reviewed";
  updated: string;
};

type Metadata = {
  controls: BaseMeta & {
    stage: string; builds: string[]; time: string; case?: string; tools: string[];
    owasp: string[]; checklist: string; agent_rule: string;
  };
  stages: BaseMeta & { order: number; time: string };
  builds: BaseMeta & { controls: string[] };
  blog: BaseMeta & { date: string; excerpt: string; author?: string };
  pages: BaseMeta;
};

type Kind = keyof Metadata;
export type Content<K extends Kind = Kind> = { slug: string; kind: K; meta: Metadata[K]; body: string };

const markdown = import.meta.glob("../../content/**/*.md", { query: "?raw", import: "default", eager: true });

function text(meta: Record<string, unknown>, key: string, file: string): string {
  const value = meta[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${file}: ${key} is required and must be text`);
  return value;
}

function optionalText(meta: Record<string, unknown>, key: string, file: string): string | undefined {
  return meta[key] === undefined ? undefined : text(meta, key, file);
}

function list(meta: Record<string, unknown>, key: string, file: string, required = false): string[] {
  const value = meta[key];
  if (value === undefined && !required) return [];
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === "string" && Boolean(item.trim()))
    || (required && value.length === 0)) throw new Error(`${file}: ${key} must be ${required ? "a non-empty" : "an"} array of text`);
  return value;
}

function load(file: string, raw: string): Content {
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`${file}: YAML frontmatter is required`);
  let parsed: unknown;
  try { parsed = parse(frontmatter[1]); }
  catch (error) { throw new Error(`${file}: invalid YAML: ${String(error)}`); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${file}: frontmatter must be a mapping`);
  const meta = parsed as Record<string, unknown>;
  const parts = file.split("/");
  const slug = parts.pop()!.replace(/\.md$/, "");
  const kind = parts.pop();
  const review = meta.review;
  if (review !== "pending" && review !== "reviewed") throw new Error(`${file}: review must be pending or reviewed`);
  const base: BaseMeta = {
    title: text(meta, "title", file),
    description: kind === "blog" ? optionalText(meta, "description", file) ?? text(meta, "excerpt", file) : text(meta, "description", file),
    review,
    updated: text(meta, "updated", file),
  };
  const body = raw.slice(frontmatter[0].length).trim();
  switch (kind) {
    case "controls": return { slug, kind, body, meta: {
      ...base, stage: text(meta, "stage", file), builds: list(meta, "builds", file, true), time: text(meta, "time", file),
      case: optionalText(meta, "case", file), tools: list(meta, "tools", file), owasp: list(meta, "owasp", file),
      checklist: text(meta, "checklist", file), agent_rule: text(meta, "agent_rule", file),
    } };
    case "stages": {
      const order = meta.order;
      if (typeof order !== "number" || !Number.isInteger(order)) throw new Error(`${file}: order must be an integer`);
      return { slug, kind, body, meta: { ...base, order, time: text(meta, "time", file) } };
    }
    case "builds": return { slug, kind, body, meta: { ...base, controls: list(meta, "controls", file, true) } };
    case "blog": return { slug, kind, body, meta: {
      ...base, date: text(meta, "date", file), excerpt: text(meta, "excerpt", file), author: optionalText(meta, "author", file),
    } };
    case "pages": return { slug, kind, body, meta: base };
    default: throw new Error(`${file}: unsupported content kind`);
  }
}

const items = Object.entries(markdown).map(([file, raw]) => load(file, raw as string));
export const getControls = () => items.filter((item): item is Content<"controls"> => item.kind === "controls");
export const getControl = (slug?: string) => getControls().find((item) => item.slug === slug);
export const getStages = () => items.filter((item): item is Content<"stages"> => item.kind === "stages").sort((a, b) => a.meta.order - b.meta.order);
export const getBuilds = () => items.filter((item): item is Content<"builds"> => item.kind === "builds");
export const getPosts = () => items.filter((item): item is Content<"blog"> => item.kind === "blog").sort((a, b) => b.meta.date.localeCompare(a.meta.date));
export const getPost = (slug?: string) => getPosts().find((item) => item.slug === slug);
export const getPage = (slug?: string) => items.find((item): item is Content<"pages"> => item.kind === "pages" && item.slug === slug);
