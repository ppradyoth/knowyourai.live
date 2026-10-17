import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { experimental, toolStages } from "../data/tools";

const toolCount = toolStages.reduce((sum, stage) => sum + stage.tools.length, 0);

export default function Tools() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const id = hash.slice(1);
    if (toolStages.some((stage) => stage.tools.some((tool) => tool.slug === id))) {
      navigate(`/tools/${id}`, { replace: true });
    } else if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, [hash, navigate]);

  return (
    <>
      <SEO title="Tools" description={`${toolCount} free AI security tools, with commands, research links and clear limits for checking models, testing behavior and controlling tool actions.`} path="/tools" />
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
              <div className="tool-index-links">{stage.tools.map((tool) => <Link key={tool.slug} to={`/tools/${tool.slug}`}>{tool.name}</Link>)}</div>
            </div>
          ))}
        </nav>
      </Section>

      {toolStages.map((stage) => (
        <section key={stage.id} id={stage.id} className="section tool-stage">
          <header className="section-header">
            <p className="eyebrow">{stage.title}</p>
            <h2>{stage.question}</h2>
          </header>
          <div className="card-grid two-col">{stage.tools.map((tool) => <article className="card" key={tool.slug}>
            <p className="tool-meta">{tool.status}</p>
            <h3><Link to={`/tools/${tool.slug}`}>{tool.name}</Link></h3>
            <p className="card-description">{tool.pitch}</p>
          </article>)}</div>
        </section>
      ))}

      <Section heading="h2" title="Early and experimental" description="Listed for completeness. Not ready to rely on.">
        <ul className="list">
          {experimental.map((item) => (
            <li key={item.name}><a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--primary)" }}>{item.name} ↗</a> {item.note}</li>
          ))}
        </ul>
      </Section>

      <Section heading="h2" title="Know the limit" description="Each tool states what it checks and where it stops. Read its limits before relying on a result." />

      <Section heading="h2" title="Want someone else to run the tests?" description="The same methods, applied to your system by us, with a findings report at the end.">
        <div className="hero-actions">
          <Link to="/services" className="button-primary">See assessments</Link>
          <Link to="/case-studies" className="button-secondary">Read the research</Link>
        </div>
      </Section>
    </>
  );
}
