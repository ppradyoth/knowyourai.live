import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="page-stack">
      <section className="hero panel soft-panel">
        <p className="eyebrow">AI Behavior QA Platform</p>
        <h1>Know when your AI crosses the line before your users do.</h1>
        <p className="hero-copy">
          KnowYourAI stress-tests assistant behavior against your intended use case,
          highlights drift patterns, and gives your team a structured risk report in minutes.
        </p>
        <div className="hero-actions">
          <Link className="button-like" to="/intent-check">
            Run Intent Check
          </Link>
          <Link className="text-link" to="/docs">
            Read Documentation
          </Link>
        </div>
      </section>

      <section className="card-grid" aria-label="Key capabilities">
        <article className="panel">
          <h2>Constraint-Aware Prompt Generation</h2>
          <p>
            Generates realistic, dynamic probes from your scope, disallowed actions, and supported languages.
          </p>
        </article>
        <article className="panel">
          <h2>Drift Detection Engine</h2>
          <p>
            Flags capability drift, role drift, and domain violations with confidence and severity annotations.
          </p>
        </article>
        <article className="panel">
          <h2>Actionable Reports</h2>
          <p>
            Produces a clean summary of total tests, detected violations, and an overall risk score.
          </p>
        </article>
      </section>
    </div>
  );
}
