import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { contributions, contributionsVerifiedAt, publications, type ContributionStatus } from "../data/research";

const statusLabel: Record<ContributionStatus, string> = { merged: "Merged", open: "Open PR", closed: "Closed without merge" };
const statusColor: Record<ContributionStatus, string> = { merged: "var(--success)", open: "var(--primary)", closed: "var(--muted)" };
const counts = contributions.reduce((acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }), { merged: 0, open: 0, closed: 0 });
const checked = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(contributionsVerifiedAt));
const linkStyle = { fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)" } as const;

export default function Research() {
  return (
    <>
      <SEO title="Publications & open source" description="Published AI security research and upstream contributions to the tools that secure AI, including NVIDIA garak, Promptfoo and Presidio." path="/research" />
      <Section
        eyebrow="Research"
        title="Research beyond the test"
        description="Papers we have published and fixes we have contributed to the open-source tools that secure AI."
        className="hero-section"
      />

      <Section title="Publications">
        <div style={{ display: "grid", gap: 16 }}>
          {publications.map((pub) => (
            <article key={pub.title} className="card">
              <h3>{pub.title}</h3>
              <p style={{ fontSize: "0.86rem", color: "var(--muted)", marginTop: 4 }}>{pub.venue} · {pub.date}</p>
              {pub.summary && <p className="card-description">{pub.summary}</p>}
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {pub.link && <a href={pub.link} target="_blank" rel="noopener noreferrer" style={linkStyle}>Paper ↗</a>}
                {pub.code && <a href={pub.code} target="_blank" rel="noopener noreferrer" style={linkStyle}>Code &amp; eval logs ↗</a>}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Upstream contributions"
        description={`${counts.merged} merged, ${counts.open} open${counts.closed ? `, ${counts.closed} closed without merge` : ""}. Status recorded ${checked}; each link shows the current state.`}
      >
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead><tr><th scope="col">Project</th><th scope="col">Change</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {contributions.map((c) => (
                <tr key={`${c.repository}#${c.number}`}>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{c.project}</td>
                  <td>
                    {c.description}{" "}
                    <a href={`https://github.com/${c.repository}/pull/${c.number}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>PR #{c.number} ↗</a>
                  </td>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap", color: statusColor[c.status] }}>{statusLabel[c.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Independent use" description="The Prompt Injection CTF was adopted by an engineer at Apiiro as the fixtures for a published nine-model study. The original Jack & Jill vulnerability was confirmed by its founder.">
        <div className="hero-actions">
          <Link to="/case-studies" className="button-primary">Read the case studies</Link>
          <Link to="/tools" className="button-secondary">Browse the tools</Link>
        </div>
      </Section>
    </>
  );
}
