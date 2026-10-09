import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";

const services = [
  {
    title: "AI Red-Team Assessment",
    description: "Hands-on adversarial testing of your AI system. We attack your AI the way real threat actors would — and deliver a findings report with reproduction steps, severity ratings, and remediation guidance.",
    includes: [
      "Scoping call to map your AI attack surface",
      "Adversarial testing across 8+ attack strategies",
      "Prompt injection (direct and indirect)",
      "Agent tool hijacking and escalation testing",
      "Data exfiltration and system prompt extraction",
      "Behavioral drift and jailbreak probing",
      "Findings report with evidence and remediation",
      "Walkthrough call with your engineering team",
    ],
    best: "Teams shipping AI features who need external validation before or after launch.",
  },
  {
    title: "Document & RAG Injection Audit",
    description: "Targeted assessment of document processing pipelines — resume uploads, file attachments, knowledge bases, RAG retrieval. We test whether adversarial content in uploaded files can hijack your AI's behavior.",
    includes: [
      "Crafted adversarial documents (PDF, DOCX, TXT)",
      "Hidden text injection (white-on-white, metadata, formatting)",
      "RAG context spoofing with fabricated retrieval format",
      "Cross-document poisoning analysis",
      "Findings report with reproduction artifacts",
    ],
    best: "Products that accept user-uploaded documents or connect to external knowledge bases.",
  },
  {
    title: "Ongoing Red-Team Retainer",
    description: "Continuous adversarial testing as your AI system evolves. New feature launches, model updates, and prompt changes all create new attack surface. We test continuously so you ship with confidence.",
    includes: [
      "Monthly adversarial testing cycles",
      "New deployment and model update reviews",
      "Attack surface monitoring",
      "Priority findings with Slack/email alerts",
      "Quarterly executive risk summary",
      "Direct line to our research team",
    ],
    best: "Teams with production AI handling sensitive data, financial transactions, or regulated workflows.",
  },
];

export default function Services() {
  return (
    <>
      <SEO
        title="AI Red-Teaming Services"
        description="Expert adversarial testing for AI systems. Prompt injection, agent hijacking, data exfiltration, and behavioral drift assessments by experienced security researchers."
        path="/services"
      />
      <Section
        title="AI Red-Teaming Services"
        description="We find vulnerabilities in AI systems before attackers do. Every engagement is hands-on adversarial testing by experienced security researchers — not automated scans."
        className="hero-section"
      />

      <Section>
        <div style={{ display: "grid", gap: 24 }}>
          {services.map((s) => (
            <article key={s.title} className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>{s.title}</h2>
              <p style={{ lineHeight: 1.6, maxWidth: "68ch" }}>{s.description}</p>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", marginBottom: 10 }}>What's included</h3>
                  <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                    {s.includes.map((item) => (
                      <li key={item} style={{ fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.5 }}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", marginBottom: 10 }}>Best for</h3>
                  <p style={{ fontSize: "0.94rem", color: "var(--text)", lineHeight: 1.6 }}>{s.best}</p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link to="/request" className="button-primary" style={{ fontSize: "0.9rem" }}>Request This Assessment</Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Why work with us"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Real attack experience</h3>
            <p className="card-description">We've found critical vulnerabilities in production AI systems — recruiting agents, travel assistants, search features, workspace tools. Our findings are published with their disclosure records, vendor responses and evidence limits.</p>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Not just automated scans</h3>
            <p className="card-description">Every engagement involves manual adversarial testing by researchers who understand how AI systems actually break. We craft attack scenarios specific to your product, not generic prompt lists.</p>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Actionable output</h3>
            <p className="card-description">You get a findings report with reproduction steps, severity ratings mapped to OWASP and MITRE frameworks, and specific remediation guidance your team can implement immediately.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
