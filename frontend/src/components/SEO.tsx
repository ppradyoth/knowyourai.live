import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE = "https://knowyourai.live";
const DEFAULT_TITLE = "KnowYourAI — Know what your AI does, live";
const DEFAULT_DESC =
  "Open-source tools, a testing and enforcement platform, and hands-on assessments for teams shipping AI agents. Backed by published security research on production AI systems.";

export default function SEO({ title, description, path = "" }: SEOProps) {
  const fullTitle = title ? `${title} | KnowYourAI` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const url = `${SITE}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [fullTitle, desc, url]);

  return null;
}
