import { createContext } from "react";

export type SeoData = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: object[];
};

export const SeoContext = createContext<{ current: SeoData | null } | null>(null);
