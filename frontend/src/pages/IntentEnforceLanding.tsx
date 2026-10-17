import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { toolStages } from "../data/tools";

const tool = toolStages.flatMap((stage) => stage.tools).find((tool) => tool.slug === "intentenforce")!;

export default function IntentEnforceLanding() {
  return <>
    <SEO title="IntentEnforce — hosted intent policy" description={tool.pitch} path="/enforce" />
    <Section eyebrow={tool.status} title={tool.name} description={tool.pitch}>
      <p className="paragraph">{tool.problem}</p>
      <ul className="list">{tool.points.map((point) => <li key={point}>{point}</li>)}</ul>
      <div className="hero-actions"><Link to="/app/enforce" className="button-primary">Open the app</Link><Link to="/docs" className="button-secondary">Read the docs</Link></div>
    </Section>
    <Section heading="h2" title="Know the limit" description={tool.limit} />
  </>;
}
