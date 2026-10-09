import { Link } from "react-router-dom";
import Card from "../components/Card";
import Section from "../components/Section";

export default function WhyKnowYourAI() {
  return (
    <>
      {/* Hero */}
      <Section
        eyebrow="The Problem"
        title="AI models drift. You won't know until it's too late."
        description="Your AI works perfectly in testing. In production, under real user pressure, edge cases, and boundary probing — it starts to break the rules you set."
        className="why-hero"
      />

      {/* Silent failures */}
      <Section title="Three failure modes most teams miss" className="why-body">
        <div className="card-grid three-col">
          <Card
            title="Silent failures"
            description="Models don't throw errors when they violate boundaries — they just answer incorrectly. You find out from compliance violations or customer complaints."
          />
          <Card
            title="No systematic testing"
            description="Manual testing finds maybe 5% of edge cases. Random prompts from users are not a testing strategy. By the time you see the problem, it's already in production."
          />
          <Card
            title="Reactive, not proactive"
            description="Current approaches are post-incident: monitor logs, identify drift, patch the model, re-deploy. Slow, expensive, and trust-damaging."
          />
        </div>
      </Section>

      {/* Cost */}
      <Section eyebrow="The Cost" title="Drift is expensive" className="why-body">
        <div className="why-risk-grid">
          <div className="card why-risk-card">
            <h3>For compliance teams</h3>
            <p className="card-description">Regulatory violations, audit failures, inability to prove guardrails are working. Fines, revoked licenses, brand damage.</p>
          </div>
          <div className="card why-risk-card">
            <h3>For product teams</h3>
            <p className="card-description">Users discover they can bypass your safety policies. Screenshots go viral. Trust evaporates. Features get disabled or rolled back.</p>
          </div>
          <div className="card why-risk-card">
            <h3>For engineering teams</h3>
            <p className="card-description">No way to measure behavior drift before production. Vague incidents like "model is acting weird." High-touch post-mortems, slow resolutions.</p>
          </div>
          <div className="card why-risk-card">
            <h3>For finance</h3>
            <p className="card-description">Incident response is expensive. Retraining, re-evaluation, customer support spikes. Opportunity cost of rolled-back features and disabled endpoints.</p>
          </div>
        </div>
      </Section>

      {/* Solution */}
      <Section
        eyebrow="The Solution"
        title="KnowYourAI: systematic AI boundary testing"
        description="Catch drift before production. Enforce boundaries at runtime."
        className="why-body"
      >
        <div className="card-grid two-col">
          <div className="card">
            <h3>IntentScan — pre-production testing</h3>
            <ul className="list" style={{ marginTop: "12px" }}>
              <li>Multi-strategy probe generation — role transformation, gradual drift, language variation</li>
              <li>Automated boundary testing — up to 200 test cases in minutes</li>
              <li>Risk scoring — clear severity and confidence for each violation</li>
              <li>Actionable evidence — exact prompts and responses that break boundaries</li>
            </ul>
          </div>
          <div className="card">
            <h3>IntentEnforce — runtime guardrails</h3>
            <ul className="list" style={{ marginTop: "12px" }}>
              <li>Intent classification — understand what users are asking for</li>
              <li>Policy enforcement — block disallowed intents, allow safe ones, clarify ambiguous requests</li>
              <li>Response validation — detect injection attempts and malicious responses</li>
              <li>Proxy layer — sits between your users and your AI, zero code changes required</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Comparison table */}
      <Section eyebrow="The Difference" title="What sets KnowYourAI apart" className="why-body">
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Manual testing</th>
                <th>Monitoring only</th>
                <th>KnowYourAI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Catch drift before production</td>
                <td className="cell-no">Slow, incomplete</td>
                <td className="cell-no">Already broken</td>
                <td className="cell-yes">Every deploy</td>
              </tr>
              <tr>
                <td>Works with any LLM / API</td>
                <td className="cell-yes">Yes</td>
                <td className="cell-yes">Yes</td>
                <td className="cell-yes">Yes</td>
              </tr>
              <tr>
                <td>Systematic multi-strategy testing</td>
                <td className="cell-no">Not systematic</td>
                <td className="cell-no">No testing</td>
                <td className="cell-yes">3 strategies</td>
              </tr>
              <tr>
                <td>Runtime enforcement</td>
                <td className="cell-no">Not possible</td>
                <td className="cell-warn">Reactive only</td>
                <td className="cell-yes">Proactive proxy</td>
              </tr>
              <tr>
                <td>Risk scoring and severity</td>
                <td className="cell-no">Subjective</td>
                <td className="cell-no">No scoring</td>
                <td className="cell-yes">Confidence &amp; severity</td>
              </tr>
              <tr>
                <td>Compliance ready</td>
                <td className="cell-warn">Hard to audit</td>
                <td className="cell-warn">Logs only</td>
                <td className="cell-yes">Full audit trail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* USP */}
      <Section
        eyebrow="Our USP"
        title="The only platform that does both"
        description="Pre-production testing + runtime enforcement = complete AI safety coverage."
        className="why-body"
      >
        <div className="card-grid three-col">
          <Card
            title="Comprehensive"
            description="Not just monitoring drift — systematically discovering it before it reaches users. Three strategies cover role subversion, gradual drift, and cross-language consistency."
          />
          <Card
            title="Universal"
            description="Works with any LLM, any API, any deployment. OpenAI, Anthropic, Gemini, open-source, custom models — integrates in minutes without code changes."
          />
          <Card
            title="Confidence"
            description="Risk scores, violation evidence, and intent-based routing mean you know exactly what's broken, how bad it is, and how to fix it. No guessing."
          />
        </div>
      </Section>

      {/* CTA */}
      <Section
        eyebrow="Next Step"
        title="See it in action"
        description="Try KnowYourAI on your own API in minutes."
        className="why-closing"
      >
        <div className="hero-actions">
          <Link to="/intentscan" className="button-primary">Run a Scan</Link>
          <Link to="/enforce" className="button-secondary">Try Enforcement</Link>
        </div>
      </Section>
    </>
  );
}
