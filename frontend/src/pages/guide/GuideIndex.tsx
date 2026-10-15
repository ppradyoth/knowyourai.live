import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
import { getStages, getBuilds } from "../../lib/content";

export default function GuideIndex() {
  return <section className="section gd-guide">
    <SEO title="Ship your AI product safely" description="A practical guide for teams with no security team. Start with a one-hour baseline, then choose the controls for the AI product you are building." path="/guide" />
    <header className="section-header"><p className="eyebrow">The developer guide</p><h1>Ship your AI product safely</h1>
      <p>The guide for teams with no security team.</p></header>
    <Link className="button-primary" to="/guide/stage/one-hour-baseline">Start with the one-hour baseline</Link>
    <h2>Five stages</h2>
    <ol className="gd-guide-timeline">{getStages().map((stage) => <li key={stage.slug}>
      <span className="gd-guide-time">{stage.meta.time}</span><div><h3><Link to={`/guide/stage/${stage.slug}`}>{stage.meta.title}</Link></h3><p>{stage.meta.description}</p></div>
    </li>)}</ol>
    <h2>What are you building?</h2>
    <div className="gd-guide-grid">{getBuilds().map((build) => <Link className="card" key={build.slug} to={`/guide/build/${build.slug}`}><h3>{build.meta.title}</h3><p>{build.meta.description}</p></Link>)}</div>
    <section><h2>Know the limit</h2><p>A checklist does not prove your product is safe. Test each control against your own tools, data and permissions, and read the limits on each page.</p></section>
  </section>;
}
