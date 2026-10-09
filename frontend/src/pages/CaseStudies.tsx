import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { caseEvidence, caseStudies, researchNotes, studies, type CaseStudy, type EvidenceRecord, type Study } from "../data/research";

const anchorId = (target: string) => `case-${target.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
const severityColor: Record<CaseStudy["severity"], string> = {
  Critical: "var(--danger)",
  High: "var(--warning)",
  Medium: "var(--primary)",
  Low: "var(--muted)",
};
const label = { fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", marginBottom: 8 } as const;
const body = { fontSize: "0.94rem", lineHeight: 1.6 } as const;
const totalFindings = caseStudies.reduce((sum, c) => sum + c.findings, 0);

function Evidence({ records }: { records: EvidenceRecord[] }) {
  if (!records.length) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={label}>Evidence records</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {records.map((r) => (
          <figure key={r.id} style={{ margin: 0, padding: 16, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>{r.title}</p>
            {r.excerpt && <blockquote style={{ margin: "0 0 8px", paddingLeft: 12, borderLeft: "3px solid var(--border)", whiteSpace: "pre-line", ...body }}>{r.excerpt}</blockquote>}
            {r.columns && (
              <div className="comparison-table-wrap" style={{ marginBottom: 8 }}>
                <table className="comparison-table">
                  <thead><tr>{r.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
                  <tbody>{r.rows?.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
            <figcaption style={{ fontSize: "0.86rem", color: "var(--muted)", lineHeight: 1.5 }}>{r.caption}<br />{r.date} · {r.source}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function CaseCard({ c, open, onToggle }: { c: CaseStudy; open: boolean; onToggle: () => void }) {
  return (
    <article id={anchorId(c.target)} className="card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>{c.target}</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{c.org} · {c.date}</p>
        </div>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: severityColor[c.severity] }}>
          {c.severityDetail || c.severity} · {c.findings} reported {c.findings === 1 ? "finding" : "findings"}
        </span>
      </div>
      <p style={{ marginTop: 14, fontWeight: 600, lineHeight: 1.4 }}>{c.hook}</p>
      <p style={{ marginTop: 6, fontSize: "0.86rem", color: "var(--muted)" }}>{c.status}</p>
      <button type="button" className="button-secondary" onClick={onToggle} aria-expanded={open} aria-controls={`${anchorId(c.target)}-detail`} style={{ width: "auto", marginTop: 14, fontSize: "0.88rem", padding: "6px 14px", minHeight: "unset" }}>
        {open ? "Close case" : "Read the full case"}
      </button>
      <div id={`${anchorId(c.target)}-detail`} hidden={!open}>
        {open && (
          <>
            <p style={{ marginTop: 18, ...body }}>{c.summary}{c.cvss && ` Researcher-assessed CVSS ${c.cvss}.`}</p>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.categories.map((v) => <span key={v} style={{ fontSize: "0.82rem", padding: "4px 10px", borderRadius: 6, background: "var(--surface-2)", border: "1px solid var(--border)" }}>{v}</span>)}
            </div>
            {c.chain && <div style={{ marginTop: 20 }}><h3 style={label}>What happened</h3><ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>{c.chain.map((step, i) => <li key={i} style={body}>{step}</li>)}</ol></div>}
            {c.impact && <p style={{ marginTop: 16, ...body }}><strong>Why it matters.</strong> {c.impact}</p>}
            {c.revisit && <div style={{ marginTop: 16 }}><h3 style={label}>Follow-up record</h3><p style={body}>{c.revisit}</p></div>}
            {c.scope && <div style={{ marginTop: 16 }}><h3 style={label}>Evidence &amp; scope</h3><p style={body}>{c.scope}</p></div>}
            {c.timeline && <div style={{ marginTop: 16 }}><h3 style={label}>Disclosure record</h3><ol style={{ margin: 0, paddingLeft: 20 }}>{c.timeline.map((t, i) => <li key={i} style={body}>{t.event}</li>)}</ol></div>}
            {c.vendorResponse && <p style={{ marginTop: 16, ...body }}><strong>Vendor response.</strong> {c.vendorResponse}</p>}
            {c.ref && <p style={{ marginTop: 12 }}><a href={c.ref} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--primary)" }}>Related upstream work ↗</a></p>}
            <Evidence records={caseEvidence[c.target] ?? []} />
          </>
        )}
      </div>
    </article>
  );
}

function StudyCard({ s, open, onToggle }: { s: Study; open: boolean; onToggle: () => void }) {
  return (
    <article id={anchorId(s.target)} className="card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>{s.target}</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{s.date}</p>
        </div>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>{s.kind}</span>
      </div>
      <p style={{ marginTop: 14, fontWeight: 600, lineHeight: 1.4 }}>{s.hook}</p>
      <button type="button" className="button-secondary" onClick={onToggle} aria-expanded={open} aria-controls={`${anchorId(s.target)}-detail`} style={{ width: "auto", marginTop: 14, fontSize: "0.88rem", padding: "6px 14px", minHeight: "unset" }}>
        {open ? "Close" : "Read more"}
      </button>
      <div id={`${anchorId(s.target)}-detail`} hidden={!open}>
        {open && (
          <>
            <p style={{ marginTop: 18, ...body }}>{s.summary}</p>
            <p style={{ marginTop: 16, ...body }}><strong>Why it matters.</strong> {s.impact}</p>
            <div style={{ marginTop: 16 }}><h3 style={label}>Evidence &amp; scope</h3><p style={body}>{s.scope}</p></div>
            {s.ref && <p style={{ marginTop: 12 }}><a href={s.ref} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--primary)" }}>Inspect the tested repository ↗</a></p>}
            <Evidence records={s.evidence} />
          </>
        )}
      </div>
    </article>
  );
}

export default function CaseStudies() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (target: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(target)) next.delete(target); else next.add(target);
    return next;
  });

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const match = [...caseStudies, ...studies].find((item) => anchorId(item.target) === id);
    if (!match) return;
    setExpanded(new Set([match.target]));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

  return (
    <>
      <SEO
        title="Case Studies — AI Security Findings"
        description={`${caseStudies.length} case studies and ${studies.length} studies from independent testing of production AI systems, each with its disclosure record, vendor response and evidence limits.`}
        path="/case-studies"
      />
      <Section
        eyebrow="Research"
        title="Where AI systems lose the boundary"
        description="We test how untrusted text becomes an instruction, a tool call, or a claim people rely on. Every case below records what was observed, what was not established, how it was disclosed, and how the vendor responded."
        className="hero-section"
      />

      <Section>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", marginBottom: 20 }}>
          <StatBlock value={caseStudies.length} label="Case studies" />
          <StatBlock value={totalFindings} label="Original reported findings" />
          <StatBlock value={studies.length} label="Benchmarks & observations" />
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: 28, maxWidth: 820, lineHeight: 1.6 }}>
          Severity and CVSS are researcher assessments. Vendor responses and evidence limits are recorded per case. Studies and observations are excluded from finding counts.
        </p>

        <div style={{ display: "grid", gap: 24 }}>
          {caseStudies.map((c) => <CaseCard key={c.target} c={c} open={expanded.has(c.target)} onToggle={() => toggle(c.target)} />)}
          {studies.map((s) => <StudyCard key={s.target} s={s} open={expanded.has(s.target)} onToggle={() => toggle(s.target)} />)}
        </div>

        <details style={{ marginTop: 28 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Reconnaissance &amp; research notes ({researchNotes.length} packages)</summary>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {researchNotes.map((n) => <div key={n.target}><h3 style={{ fontSize: "1rem" }}>{n.target}</h3><p style={{ color: "var(--muted)", ...body }}>{n.summary}</p></div>)}
          </div>
        </details>

        <p style={{ marginTop: 32, fontSize: "0.86rem", color: "var(--muted)", maxWidth: 820, lineHeight: 1.6 }}>
          All work here was performed independently, on personal time, equipment, and accounts, outside and unrelated to any employment. It uses no employer systems, data, or resources and does not represent any employer's views. Public records omit attack payloads and sensitive source material. Full reproduction is available to the affected vendor on request.
        </p>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: 16 }}>Two ways to find this in your own system.</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link to="/tools" className="button-primary">Test it yourself</Link>
            <Link to="/request" className="button-secondary">Request an assessment</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}
