import { Link, useParams } from "react-router-dom";
import SEO from "../../components/SEO";
import Markdown from "../../components/Markdown";
import CaseExcerpt from "../../components/guide/CaseExcerpt";
import GuideNav from "../../components/guide/GuideNav";
import ToolLink from "../../components/guide/ToolLink";
import { getControl, getControls, getStages } from "../../lib/content";
import NotFound from "../NotFound";

export default function GuideControl() {
  const { slug } = useParams();
  const control = getControl(slug);
  if (!control) return <NotFound />;
  const { meta } = control;
  const stage = getStages().find((item) => item.slug === meta.stage);
  const controls = getControls().filter((item) => item.meta.stage === meta.stage);
  const next = controls[controls.findIndex((item) => item.slug === control.slug) + 1];
  const path = `/guide/controls/${control.slug}`;
  return <section className="section gd-guide">
    <SEO title={meta.title} description={meta.description} path={path} noindex={meta.review === "pending"} jsonLd={[
      { "@context": "https://schema.org", "@type": "TechArticle", headline: meta.title, description: meta.description, dateModified: meta.updated, author: { "@type": "Organization", name: "KnowYourAI" } },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guide", item: "https://knowyourai.live/guide" },
        { "@type": "ListItem", position: 2, name: stage?.meta.title ?? meta.stage, item: `https://knowyourai.live/guide/stage/${meta.stage}` },
        { "@type": "ListItem", position: 3, name: meta.title, item: `https://knowyourai.live${path}` },
      ] },
    ]} />
    <nav aria-label="Breadcrumb"><Link to="/guide">Guide</Link> › <Link to={`/guide/stage/${meta.stage}`}>{stage?.meta.title ?? meta.stage}</Link></nav>
    <header className="section-header"><h1>{meta.title}</h1><p className="gd-guide-meta">{stage?.meta.title ?? meta.stage} · {meta.time}{meta.owasp.length > 0 && ` · ${meta.owasp.join(", ")}`} · {meta.review === "pending" ? "Draft, not yet reviewed" : `Last reviewed ${meta.updated}`}</p></header>
    <div className="gd-guide-layout"><article className="gd-guide-main">
      <Markdown afterHeading={meta.case ? { "what-happened-in-production": <CaseExcerpt slug={meta.case} /> } : {}}>{control.body}</Markdown>
      <aside className="card gd-checklist-line"><h2>Checklist line</h2><p>{meta.checklist}</p></aside>
      {meta.tools.length > 0 && <section><h2>Tools</h2><div className="gd-guide-grid">{meta.tools.map((slug) => <ToolLink key={slug} slug={slug} />)}</div></section>}
      {next && <p className="gd-guide-next">Next in this stage: <Link to={`/guide/controls/${next.slug}`}>{next.meta.title}</Link></p>}
      <p className="gd-guide-meta">Want this tested on your system? <Link to="/request">Request an assessment.</Link></p>
    </article><GuideNav stage={meta.stage} current={control.slug} /></div>
  </section>;
}
