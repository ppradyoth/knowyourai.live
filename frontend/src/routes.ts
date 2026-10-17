import { caseStudies, studies } from "./data/research";
import { toolStages } from "./data/tools";
import { getPosts, getControls, getStages, getBuilds } from "./lib/content";

export function publicRoutes(): string[] {
  return [
    "/", "/intentscan", "/enforce", "/tools", "/case-studies", "/docs", "/research", "/blog", "/services",
    "/how-it-works", "/request", "/pricing", "/assessment", "/about", "/contact",
    "/security", "/ethics", "/terms", "/privacy", "/cookies", "/product",
    "/architecture", "/use-cases", "/why", "/why-knowyourai", "/whats-unique",
    ...[...caseStudies, ...studies].map((item) => `/case-studies/${item.slug}`),
    ...toolStages.flatMap((stage) => stage.tools.map((tool) => `/tools/${tool.slug}`)),
    ...getPosts().map((post) => `/blog/${post.slug}`),
    "/guide", "/checklist",
    ...getControls().map((item) => `/guide/controls/${item.slug}`),
    ...getStages().map((item) => `/guide/stage/${item.slug}`),
    ...getBuilds().map((item) => `/guide/build/${item.slug}`),
  ];
}

export const appShellRoutes = [
  "/login", "/signup", "/dashboard", "/account", "/scans", "/scans/**",
  "/layers", "/layers/**", "/app/**", "/demo",
];
