import { Link } from "react-router-dom";
import Card from "../components/Card";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Pricing() {
  return (
    <>
      <SEO title="Pricing" description="IntentScan and IntentEnforce are free. Sign in, add your own Claude or Gemini API key, and run them on your AI system." path="/pricing" />
      <Section
        eyebrow="Pricing"
        title="Free. Bring your own model key."
        description="IntentScan and IntentEnforce cost nothing to use. They run on your own Claude or Gemini API key, so you pay your model provider directly for the calls you make and nothing to us."
      />

      <Section title="What you get">
        <div className="card-grid three-col">
          <Card title="IntentScan" description="Adversarial probes against your AI endpoint">
            <ul className="list">
              <li>Role transformation, gradual drift and language variation strategies</li>
              <li>Violation analysis with a 0–100 risk score</li>
              <li>Scan history and PDF reports</li>
            </ul>
          </Card>
          <Card title="IntentEnforce" description="Runtime intent policy in front of your model">
            <ul className="list">
              <li>Per-request intent classification</li>
              <li>Allow, block or clarify policy rules</li>
              <li>Proxy layers with request logs</li>
            </ul>
          </Card>
          <Card title="Fair-use limits" description="Per account, to keep the service free for everyone">
            <ul className="list">
              <li>1,000 tests per month</li>
              <li>10 requests per minute</li>
              <li>Your model key is encrypted at rest and removable at any time</li>
            </ul>
          </Card>
        </div>
        <p className="paragraph" style={{ marginTop: 24 }}>
          The one paid service is a hands-on red-team assessment, because it takes our time. It is scoped and quoted per engagement.
        </p>
        <div className="hero-actions" style={{ marginTop: 16 }}>
          <Link to="/signup" className="button-primary">Create a free account</Link>
          <Link to="/tools" className="button-secondary">See the open-source tools</Link>
          <Link to="/request" className="button-secondary">Request a paid assessment</Link>
        </div>
      </Section>
    </>
  );
}
