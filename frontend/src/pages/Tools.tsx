import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { experimental, toolStages, type Tool } from "../data/tools";

const toolCount = toolStages.reduce((sum, stage) => sum + stage.tools.length, 0);

function Terminal({ command, output }: { command: string; output?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
        <button type="button" className="terminal-copy" onClick={copy} aria-live="polite">{copied ? "Copied" : "Copy"}</button>
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
        <h2>{tool.name}</h2>
        <p className="tool-pitch">{tool.pitch}</p>
        <p className="tool-problem">{tool.problem}</p>
        <ul className="list">{tool.points.map((point) => <li key={point}>{point}</li>)}</ul>
        <p className="tool-limit"><strong>Know the limit.</strong> {tool.limit}</p>
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

export default function Tools() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

  return (
    <>
      <SEO title="Tools" description={`${toolCount} free tools for knowing what your AI is, how it behaves under attack, and what it is allowed to do in production. Open source, with the limits of each stated.`} path="/tools" />
      <Section
        eyebrow="For developers"
        title="Every tool, what it proves, and where it stops"
        description="Free and open. Each one answers a single question about your AI, runs in a command or two, and says plainly what it does not cover."
        className="hero-section"
      />

      <Section>
        <nav className="tool-index" aria-label="Tools by stage">
          {toolStages.map((stage) => (
            <div key={stage.id}>
              <a href={`#${stage.id}`} className="tool-index-stage">{stage.title}</a>
              <div className="tool-index-links">{stage.tools.map((tool) => <a key={tool.slug} href={`#${tool.slug}`}>{tool.name}</a>)}</div>
            </div>
          ))}
        </nav>
      </Section>

      {toolStages.map((stage) => (
        <section key={stage.id} id={stage.id} className="section tool-stage">
          <header className="section-header">
            <p className="eyebrow">{stage.title}</p>
            <h1>{stage.question}</h1>
          </header>
          {stage.tools.map((tool) => <ToolSection key={tool.slug} tool={tool} />)}
        </section>
      ))}

      <Section title="Early and experimental" description="Listed for completeness. Not ready to rely on.">
        <ul className="list">
          {experimental.map((item) => (
            <li key={item.name}><a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--primary)" }}>{item.name} ↗</a> {item.note}</li>
          ))}
        </ul>
      </Section>

      <Section title="Want someone else to run the tests?" description="The same methods, applied to your system by us, with a findings report at the end.">
        <div className="hero-actions">
          <Link to="/services" className="button-primary">See assessments</Link>
          <Link to="/case-studies" className="button-secondary">Read the research</Link>
        </div>
      </Section>
    </>
  );
}
