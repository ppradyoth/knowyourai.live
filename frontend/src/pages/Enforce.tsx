import { FormEvent, useState } from "react";
import { useLocation } from "react-router-dom";
import { runEnforce } from "../api";
import { useAuth } from "../hooks/useAuth";
import Section from "../components/Section";
import type { EnforceResponse } from "../types";

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Enforce() {
  const { state } = useLocation();
  const [prompt, setPrompt] = useState("");
  const [targetApi, setTargetApi] = useState("https://example.com/ai-endpoint");
  const [allowed, setAllowed] = useState(() => state?.assessmentPolicy?.allowed.join(",") ?? "payments_api_help,sdk_usage");
  const [blocked, setBlocked] = useState(() => state?.assessmentPolicy?.blocked.join(",") ?? "financial_advice,general_coding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnforceResponse | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await runEnforce({
        prompt,
        target_api: targetApi,
        config: {
          allowed: splitCsv(allowed),
          blocked: splitCsv(blocked),
        },
      }, token);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to run enforcement.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section
        eyebrow="Intent Layer Enforcement"
        title="Runtime intent routing and boundary enforcement"
        description="Classify intent, apply allowed/blocked policy, and decide allow, block, or clarify."
      />

      <section className="section">
        <div className="workspace-grid" aria-label="Enforcement workspace">
          <section className="panel" aria-labelledby="enforce-title">
            <header className="panel-header">
              <h2 id="enforce-title">Run Enforcement</h2>
              <p className="panel-subtitle">Provide a prompt and intent policy configuration.</p>
              {state?.assessmentPolicy && <p className="field-hint">Suggested categories imported from your assessment. Review them before testing. This playground evaluates input purpose; it does not authorize tool actions or execute assessment scenarios.</p>}
            </header>

            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="enforce-prompt">Prompt</label>
                <textarea
                  id="enforce-prompt"
                  required
                  rows={6}
                  placeholder="Enter user input to classify and enforce"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="target-api">Target API</label>
                <input
                  id="target-api"
                  type="url"
                  required
                  placeholder="https://your-ai-service.com/inference"
                  value={targetApi}
                  onChange={(e) => setTargetApi(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="allowed-intents">Allowed intents (comma separated)</label>
                <input
                  id="allowed-intents"
                  type="text"
                  value={allowed}
                  onChange={(e) => setAllowed(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="blocked-intents">Blocked intents (comma separated)</label>
                <input
                  id="blocked-intents"
                  type="text"
                  value={blocked}
                  onChange={(e) => setBlocked(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Running..." : "Run Enforcement"}
                </button>
              </div>
            </form>
          </section>

          <section className="panel" aria-live="polite" aria-busy={loading}>
            <header className="panel-header">
              <h2>Output</h2>
              <p className="panel-subtitle">Detected intent and policy decision.</p>
            </header>

            {loading && (
              <div className="status-block" role="status">
                <p className="status-title">Running enforcement</p>
                <p className="status-copy">Classifying intent and applying policy.</p>
              </div>
            )}

            {!loading && error && (
              <div className="status-block status-error" role="alert">
                <p className="status-title">Request failed</p>
                <p className="status-copy">{error}</p>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="status-block">
                <p className="status-title">No result yet</p>
                <p className="status-copy">Run enforcement to see intent label and decision.</p>
              </div>
            )}

            {result && !loading && (
              <div className="summary-card">
                <div className="detail-grid">
                  <p>
                    <span>Detected Intent</span>
                    <strong>{result.intent.label}</strong>
                  </p>
                  <p>
                    <span>Confidence</span>
                    <strong>{result.intent.confidence.toFixed(2)}</strong>
                  </p>
                  <p>
                    <span>Decision</span>
                    <strong>{result.decision}</strong>
                  </p>
                  <p>
                    <span>Safe</span>
                    <strong>{result.validation.safe ? "true" : "false"}</strong>
                  </p>
                </div>

                <div className="text-block">
                  <h4>Response</h4>
                  <pre>{result.response}</pre>
                </div>
              </div>
            )}

            {!loading && (
              <div className="summary-card">
                <div className="text-block">
                  <h4>Your Enforcement Endpoint</h4>
                  <pre>https://api.example.com/proxy/your-layer-id</pre>
                  <p className="status-copy">
                    Replace your AI endpoint with this to enforce behavior in production.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </>
  );
}
