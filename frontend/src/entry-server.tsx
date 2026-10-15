import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { SeoContext, type SeoData } from "./lib/seoContext";

export { publicRoutes, appShellRoutes } from "./routes";
export { getControls, getStages, getBuilds, getPosts } from "./lib/content";
export { caseStudies, studies } from "./data/research";
export { toolStages } from "./data/tools";

export async function render(url: string): Promise<{ html: string; seo: SeoData | null }> {
  return new Promise((resolve, reject) => {
    const sink: { current: SeoData | null } = { current: null };
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on("data", (chunk: Buffer) => chunks.push(chunk));
    output.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8"), seo: sink.current }));
    output.on("error", reject);

    const { pipe } = renderToPipeableStream(
      <SeoContext.Provider value={sink}>
        <StaticRouter location={url}><App /></StaticRouter>
      </SeoContext.Provider>,
      {
        onAllReady() { pipe(output); },
        onError: reject,
        onShellError: reject,
      },
    );
  });
}
