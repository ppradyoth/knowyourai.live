import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Trust() {
  return (
    <>
      <SEO title="Trust Center" description="How KnowYourAI operationalizes safe AI behavior with transparent controls and accountable reporting." path="/trust" />
      <Section
        eyebrow="Trust"
        title="Trust center for AI behavior assurance"
        description="KnowYourAI helps organizations operationalize safe AI behavior with transparent controls and accountable reporting."
      />

      <Section title="Risk mitigation approach">
        <ul className="list">
          <li>Pre-production behavior QA with repeatable tests</li>
          <li>Structured violation evidence for governance reviews</li>
          <li>Risk score and severity model for triage prioritization</li>
          <li>Clear remediation loops for product and platform teams</li>
        </ul>
      </Section>

      <Section title="Compliance-ready language">
        <p className="paragraph">
          Our reporting framework is designed to support internal model risk, policy compliance, and operational
          resilience reviews by documenting test methodology, observed outcomes, and mitigation actions.
        </p>
      </Section>

      <Section title="Runtime trust controls">
        <ul className="list">
          <li>Intent layer enforcement for real-time policy adherence</li>
          <li>Input and output checks before and after model execution</li>
          <li>Intent-based decisioning to reduce out-of-scope behavior</li>
        </ul>
      </Section>
    </>
  );
}
