import { Link, useParams } from "react-router-dom";
import SEO from "../../components/SEO";
import Markdown from "../../components/Markdown";
import { getControls, getStages } from "../../lib/content";
import NotFound from "../NotFound";

export default function GuideStage() {
  const { slug } = useParams();
  const stage = getStages().find((item) => item.slug === slug);
  if (!stage) return <NotFound />;
  return <section className="section gd-guide">
    <SEO title={stage.meta.title} description={stage.meta.description} path={`/guide/stage/${stage.slug}`} noindex={stage.meta.review === "pending"} />
    <Link to="/guide">Guide</Link>
    <header className="section-header"><h1>{stage.meta.title}</h1><p className="gd-guide-meta">{stage.meta.time} · {stage.meta.review === "pending" ? "Draft, not yet reviewed" : `Last reviewed ${stage.meta.updated}`}</p></header>
    <Markdown>{stage.body}</Markdown>
    <h2>Controls in this stage</h2>
    <ol className="gd-guide-list">{getControls().filter((control) => control.meta.stage === stage.slug).map((control) => <li key={control.slug}>
      <h3><Link to={`/guide/controls/${control.slug}`}>{control.meta.title}</Link></h3><p className="gd-guide-meta">{control.meta.time}</p><p>{control.meta.checklist}</p>
    </li>)}</ol>
  </section>;
}
