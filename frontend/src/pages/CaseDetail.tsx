import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { caseEvidence, caseStudies, studies, type CaseStudy, type EvidenceRecord, type Study } from "../data/research";
import { getControls } from "../lib/content";
import NotFound from "./NotFound";

function Evidence({ records }: { records: EvidenceRecord[] }) {
  if (!records.length) return null;
  return <section className="gd-research-group"><h2 className="gd-research-label">Evidence records</h2>
    <div className="gd-research-evidence">{records.map((record) => <figure key={record.id} className="gd-research-figure">
      <p className="gd-research-evidence-title">{record.title}</p>
      {record.excerpt && <blockquote className="gd-research-quote gd-research-body">{record.excerpt}</blockquote>}
      {record.columns && <div className="comparison-table-wrap gd-research-table"><table className="comparison-table">
        <thead><tr>{record.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{record.rows?.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
      </table></div>}
      <figcaption className="gd-research-caption">{record.caption}<br />{record.date} · {record.source}</figcaption>
    </figure>)}</div>
  </section>;
}

function CaseBody({ item }: { item: CaseStudy }) {
  return <>
    <p className="gd-research-summary gd-research-body">{item.summary}{item.cvss && ` Researcher-assessed CVSS ${item.cvss}.`}</p>
    <div className="gd-research-categories">{item.categories.map((category) => <span key={category} className="gd-research-chip">{category}</span>)}</div>
    {item.chain && <section className="gd-research-group"><h2 className="gd-research-label">What happened</h2><ol className="gd-research-steps">{item.chain.map((step, index) => <li key={index} className="gd-research-body">{step}</li>)}</ol></section>}
    {item.impact && <p className="gd-research-field gd-research-body"><strong>Why it matters.</strong> {item.impact}</p>}
    {item.revisit && <section className="gd-research-field"><h2 className="gd-research-label">Follow-up record</h2><p className="gd-research-body">{item.revisit}</p></section>}
    {item.timeline && <section className="gd-research-field"><h2 className="gd-research-label">Disclosure record</h2><ol className="gd-research-steps">{item.timeline.map((entry, index) => <li key={index} className="gd-research-body">{entry.event}</li>)}</ol></section>}
    {item.vendorResponse && <p className="gd-research-field gd-research-body"><strong>Vendor response.</strong> {item.vendorResponse}</p>}
    {item.ref && <p className="gd-research-link"><a href={item.ref} target="_blank" rel="noopener noreferrer">Related upstream work ↗</a></p>}
    <Evidence records={caseEvidence[item.target] ?? []} />
  </>;
}

function StudyBody({ item }: { item: Study }) {
  return <>
    <p className="gd-research-summary gd-research-body">{item.summary}</p>
    <p className="gd-research-field gd-research-body"><strong>Why it matters.</strong> {item.impact}</p>
    {item.ref && <p className="gd-research-link"><a href={item.ref} target="_blank" rel="noopener noreferrer">Inspect the tested repository ↗</a></p>}
    <Evidence records={item.evidence} />
  </>;
}

export default function CaseDetail() {
  const { slug } = useParams();
  const researchCase = caseStudies.find((item) => item.slug === slug);
  const study = studies.find((item) => item.slug === slug);
  const item = researchCase ?? study;
  if (!item) return <NotFound />;
  const description = item.summary.length > 155 ? `${item.summary.slice(0, 152)}...` : item.summary;
  const controls = getControls().filter((control) => control.meta.case === item.slug);
  return <>
    <SEO title={item.target} description={description} path={`/case-studies/${item.slug}`} jsonLd={[{
      "@context": "https://schema.org", "@type": "Article", headline: item.target, description: item.hook,
      author: { "@type": "Organization", name: "KnowYourAI" },
    }]} />
    <section className="section gd-research-page">
      <Link to="/case-studies">All cases and studies</Link>
      <header className="section-header"><h1>{item.target}</h1>
        <p className="gd-research-subtitle">{researchCase ? `${researchCase.org} · ${item.date}` : `${study?.kind} · ${item.date}`}</p>
        {researchCase && <p className={`gd-research-severity gd-severity-${researchCase.severity.toLowerCase()}`}>{researchCase.severityDetail || researchCase.severity} · {researchCase.findings} reported {researchCase.findings === 1 ? "finding" : "findings"}</p>}
        <p className="gd-research-hook">{item.hook}</p>
        {researchCase && <p className="gd-research-status">{researchCase.status}</p>}
      </header>
      {researchCase ? <CaseBody item={researchCase} /> : study && <StudyBody item={study} />}
      <section className="gd-research-group"><h2>Know the limit</h2><p className="gd-research-body">{item.scope ?? "Read the evidence and disclosure status above. Do not treat a reported finding as proof of the system's current behavior."}</p></section>
      <section className="gd-research-group"><h2>How to prevent this</h2>
        {controls.length ? <ul className="list">{controls.map((control) => <li key={control.slug}><Link to={`/guide/controls/${control.slug}`}>{control.meta.title}</Link>{control.meta.review === "pending" && <span className="gd-guide-meta"> · Draft, not yet reviewed</span>}</li>)}</ul> : <p className="paragraph">No guide controls reference this record yet.</p>}
      </section>
      <p className="gd-research-disclaimer">All work here was performed independently, on personal time, equipment, and accounts, outside and unrelated to any employment. It uses no employer systems, data, or resources and does not represent any employer's views. Public records omit attack payloads and sensitive source material. Full reproduction is available to the affected vendor on request.</p>
    </section>
  </>;
}
