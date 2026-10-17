import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { caseStudies, researchNotes, studies } from "../data/research";

const anchorId = (target: string) => `case-${target.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
const totalFindings = caseStudies.reduce((sum, item) => sum + item.findings, 0);

export default function CaseStudies() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const match = [...caseStudies, ...studies].find((item) => anchorId(item.target) === hash.slice(1));
    if (match) navigate(`/case-studies/${match.slug}`, { replace: true });
  }, [hash, navigate]);

  return <>
    <SEO title="Case Studies — AI Security Findings" description={`${caseStudies.length} case studies and ${studies.length} studies from independent AI security research, with disclosure records, vendor responses and evidence limits.`} path="/case-studies" />
    <Section eyebrow="Research" title="Where AI systems lose the boundary" description="We test how untrusted text becomes an instruction, a tool call, or a claim people rely on. Every case below records what was observed, what was not established, how it was disclosed, and how the vendor responded." className="hero-section" />
    <Section>
      <div className="gd-research-stats">
        <StatBlock value={caseStudies.length} label="Case studies" />
        <StatBlock value={totalFindings} label="Original reported findings" />
        <StatBlock value={studies.length} label="Benchmarks & observations" />
      </div>
      <p className="gd-research-note">Severity and CVSS are researcher assessments. Vendor responses and evidence limits are recorded per case. Studies and observations are excluded from finding counts.</p>
      <div className="gd-research-listing">
        {caseStudies.map((item) => <article key={item.slug} className="card gd-research-card">
          <div className="gd-research-heading"><div><h2 className="gd-research-title"><Link to={`/case-studies/${item.slug}`}>{item.target}</Link></h2><p className="gd-research-subtitle">{item.org} · {item.date}</p></div>
            <span className={`gd-research-severity gd-severity-${item.severity.toLowerCase()}`}>{item.severityDetail || item.severity} · {item.findings} reported {item.findings === 1 ? "finding" : "findings"}</span>
          </div>
          <p className="gd-research-hook">{item.hook}</p><p className="gd-research-status">{item.status}</p>
          <Link className="button-secondary gd-research-card-link" to={`/case-studies/${item.slug}`}>Read the full case</Link>
        </article>)}
        {studies.map((item) => <article key={item.slug} className="card gd-research-card">
          <div className="gd-research-heading"><div><h2 className="gd-research-title"><Link to={`/case-studies/${item.slug}`}>{item.target}</Link></h2><p className="gd-research-subtitle">{item.date}</p></div><span className="gd-research-severity gd-severity-low">{item.kind}</span></div>
          <p className="gd-research-hook">{item.hook}</p>
          <Link className="button-secondary gd-research-card-link" to={`/case-studies/${item.slug}`}>Read the full study</Link>
        </article>)}
      </div>
      <details className="gd-research-notes"><summary>Reconnaissance &amp; research notes ({researchNotes.length} packages)</summary><div className="gd-research-evidence">{researchNotes.map((note) => <div key={note.target}><h3>{note.target}</h3><p className="gd-research-subtitle gd-research-body">{note.summary}</p></div>)}</div></details>
      <section className="gd-research-group"><h2>Know the limit</h2><p className="gd-research-note">Severity and CVSS are researcher assessments. Read each record's evidence scope, disclosure status and vendor response.</p></section>
      <p className="gd-research-disclaimer">All work here was performed independently, on personal time, equipment, and accounts, outside and unrelated to any employment. It uses no employer systems, data, or resources and does not represent any employer's views. Public records omit attack payloads and sensitive source material. Full reproduction is available to the affected vendor on request.</p>
      <div className="gd-research-cta"><p>Two ways to find this in your own system.</p><div className="hero-actions"><Link to="/tools" className="button-primary">Test it yourself</Link><Link to="/request" className="button-secondary">Request an assessment</Link></div></div>
    </Section>
  </>;
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return <div><div className="gd-research-stat-value">{value}</div><div className="gd-research-stat-label">{label}</div></div>;
}
