import { Link } from "react-router-dom";
import Card from "../components/Card";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Product() {
  return (
    <>
      <SEO title="Platform" description="KnowYourAI Behavior QA Platform — IntentScan for pre-production testing, IntentEnforce for runtime enforcement, and a full API for integration." path="/product" />
      <Section
        eyebrow="Product"
        title="KnowYourAI Behavior QA Platform"
        description="A complete validation layer for AI systems that must remain aligned to role, domain, and policy constraints."
      />

      <Section title="Platform tools">
        <div className="card-grid two-col">
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 8 }}>IntentScan</h3>
            <p className="card-description">Pre-production adversarial testing. Define your AI's boundaries, generate adversarial probes across 8+ attack strategies, and get a risk-scored violation report.</p>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/intentscan" className="button-primary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>Run IntentScan</Link>
              <Link to="/how-it-works" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", alignSelf: "center" }}>How it works →</Link>
            </div>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: 8 }}>IntentEnforce</h3>
            <p className="card-description">Runtime proxy that classifies every prompt before it reaches your AI. Configurable allow/block/clarify policy rules enforced in real-time.</p>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/enforce" className="button-primary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>Try IntentEnforce</Link>
              <Link to="/how-it-works" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", alignSelf: "center" }}>How it works →</Link>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Core capabilities">
        <div className="card-grid three-col">
          <Card title="Constraint Builder" description="Define use-case boundaries, allowed capabilities, disallowed actions, and language coverage in one profile." />
          <Card title="Strategy Engine" description="Run RoleTransformation, GradualDrift, and LanguageVariation strategies to expose boundary weakness." />
          <Card title="Adaptive Probe Generator" description="Generate realistic, dynamic prompts using LLM-driven adversarial intent instead of hardcoded scripts." />
          <Card title="Violation Detector" description="Classify failures into capability drift, role drift, and domain violation with confidence scoring." />
          <Card title="Risk Scoring" description="Summarize scan quality through weighted severity and confidence to prioritize remediation." />
          <Card title="Structured Reporting" description="Return machine-readable output for CI gates, dashboards, and audit documentation." />
        </div>
      </Section>

      <Section
        title="Intent Layer (Runtime Enforcement)"
        description="KnowYourAI sits between users and AI systems to enforce behavior in production, not only during pre-release tests."
      >
        <div className="card-grid three-col">
          <Card title="Runtime intent classification" description="Classify each incoming prompt before it reaches your model." />
          <Card title="Policy-based allow or block" description="Enforce allowed and disallowed behaviors in real-time using intent policy rules." />
          <Card title="Live boundary control" description="Reduce drift in production by routing only compliant requests to downstream AI endpoints." />
        </div>
      </Section>

      <Section title="Integrate via API">
        <div className="card" style={{ padding: 28 }}>
          <p style={{ lineHeight: 1.6, maxWidth: "68ch" }}>
            Both IntentScan and IntentEnforce are available as REST APIs. Point your CI pipeline at the scan endpoint, or drop the enforce proxy in front of your production AI.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/docs" className="button-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>API Documentation</Link>
            <Link to="/architecture" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", alignSelf: "center" }}>Architecture →</Link>
          </div>
        </div>
      </Section>

      <Section title="Get started" className="home-final-cta">
        <div className="hero-actions" style={{ marginTop: 8 }}>
          <Link to="/signup" className="button-primary">Create Account</Link>
          <Link to="/login" className="button-secondary">Log In</Link>
        </div>
      </Section>
    </>
  );
}
