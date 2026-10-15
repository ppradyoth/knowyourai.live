const postFiles = import.meta.glob("./blog/posts/*.md", { query: "?raw", import: "default", eager: true });

export function publicRoutes(): string[] {
  return [
    "/", "/tools", "/case-studies", "/docs", "/research", "/blog", "/services",
    "/how-it-works", "/request", "/pricing", "/assessment", "/about", "/contact",
    "/security", "/ethics", "/terms", "/privacy", "/cookies", "/product",
    "/architecture", "/use-cases", "/why", "/why-knowyourai", "/whats-unique",
    ...Object.keys(postFiles).map((file) => `/blog/${file.split("/").pop()!.replace(/\.md$/, "")}`),
  ];
}

export const appShellRoutes = [
  "/login", "/signup", "/dashboard", "/account", "/scans", "/scans/**",
  "/layers", "/layers/**", "/app/**", "/intentscan", "/enforce", "/demo",
];
