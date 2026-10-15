import { Link, useParams } from "react-router-dom";
import SEO from "../../components/SEO";
import Markdown from "../../components/Markdown";
import { getBuilds, getControl } from "../../lib/content";
import NotFound from "../NotFound";

export default function GuideBuild() {
  const { slug } = useParams();
  const build = getBuilds().find((item) => item.slug === slug);
  if (!build) return <NotFound />;
  return <section className="section gd-guide">
    <SEO title={build.meta.title} description={build.meta.description} path={`/guide/build/${build.slug}`} noindex={build.meta.review === "pending"} />
    <Link to="/guide">Guide</Link><header className="section-header"><h1>{build.meta.title}</h1>
      <p className="gd-guide-meta">{build.meta.review === "pending" ? "Draft, not yet reviewed" : `Last reviewed ${build.meta.updated}`}</p></header>
    <Markdown>{build.body}</Markdown><h2>Minimum controls</h2>
    <ol className="gd-guide-list">{build.meta.controls.map((slug) => {
      const control = getControl(slug);
      return control && <li key={slug}><h3><Link to={`/guide/controls/${slug}`}>{control.meta.title}</Link></h3><p className="gd-guide-meta">{control.meta.time}</p><p>{control.meta.checklist}</p></li>;
    })}</ol>
  </section>;
}
