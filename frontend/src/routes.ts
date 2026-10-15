import { getPosts } from "./lib/content";

export function publicRoutes(): string[] {
  return [
    "/", "/tools", "/case-studies", "/docs", "/research", "/blog", "/services",
    "/how-it-works", "/request", "/pricing", "/assessment", "/about", "/contact",
    "/security", "/ethics", "/terms", "/privacy", "/cookies", "/product",
    "/architecture", "/use-cases", "/why", "/why-knowyourai", "/whats-unique",
    ...getPosts().map((post) => `/blog/${post.slug}`),
  ];
}

export const appShellRoutes = [
  "/login", "/signup", "/dashboard", "/account", "/scans", "/scans/**",
  "/layers", "/layers/**", "/app/**", "/intentscan", "/enforce", "/demo",
];
