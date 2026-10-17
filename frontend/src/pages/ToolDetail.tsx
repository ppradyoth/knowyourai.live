import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import CopyButton from "../components/CopyButton";
import { toolStages, type Tool } from "../data/tools";
import { getControls } from "../lib/content";
import NotFound from "./NotFound";

function Terminal({ command, output }: { command: string; output?: string }) {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
        <CopyButton text={command} />
      </div>
      <pre className="terminal-body"><code>{command.split("\n").map((line) => `$ ${line}`).join("\n")}{output && <span className="terminal-output">{`\n\n${output}`}</span>}</code></pre>
    </div>
  );
}

function ToolSection({ tool }: { tool: Tool }) {
  return (
    <article id={tool.slug} className="tool-section">
      <div className="tool-copy">
        <div className="tool-meta">
          <span className="tool-status">{tool.status}</span>
          {tool.license && <span>{tool.license}</span>}
        </div>
        <h1>{tool.name}</h1>
        <p className="tool-pitch">{tool.pitch}</p>
        <p className="tool-problem">{tool.problem}</p>
        <ul className="list">{tool.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <section className="tool-limit"><h2>Know the limit</h2><p>{tool.limit}</p></section>
        <div className="tool-links">
          {tool.links.map((link, i) => link.internal
            ? <Link key={link.href} to={link.href} className={i === 0 ? "button-primary" : "button-secondary"}>{link.label}</Link>
            : <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={i === 0 ? "button-primary" : "button-secondary"}>{link.label} ↗</a>)}
        </div>
      </div>
      {tool.command && <Terminal command={tool.command} output={tool.output} />}
    </article>
  );
}

export default function ToolDetail() {
  const { slug } = useParams();
  const tool = toolStages.flatMap((stage) => stage.tools).find((tool) => tool.slug === slug);
  if (!tool) return <NotFound />;
  const controls = getControls().filter((control) => control.meta.tools.includes(tool.slug));
  const description = tool.problem.length > 155 ? `${tool.problem.slice(0, 152)}...` : tool.problem;
  return <>
    <SEO title={tool.name} description={description} path={`/tools/${tool.slug}`} jsonLd={[{
      "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name,
      description: tool.pitch, applicationCategory: "SecurityApplication", offers: { "@type": "Offer", price: 0 },
      ...(tool.license ? { license: tool.license } : {}),
    }]} />
    <section className="section">
      <Link to="/tools">All tools</Link>
      <ToolSection tool={tool} />
      <section><h2>Used in the guide</h2>
        {controls.length ? <ul className="list">{controls.map((control) => <li key={control.slug}>
          <Link to={`/guide/controls/${control.slug}`}>{control.meta.title}</Link>
          {control.meta.review === "pending" && <span className="gd-guide-meta"> · Draft, not yet reviewed</span>}
        </li>)}</ul> : <p className="paragraph">No guide controls reference this tool yet.</p>}
      </section>
    </section>
  </>;
}
