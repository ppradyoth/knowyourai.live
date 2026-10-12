import { FormEvent, useState } from "react";
import type { ScanConfig } from "../types";

interface ConfigFormProps {
  onSubmit: (config: ScanConfig) => Promise<void>;
  loading: boolean;
  assessmentScope?: { purpose: string; allowed: string[]; blocked: string[] };
}

const initialForm = {
  api_url: "",
  use_case: "",
  allowedCapabilities: "",
  disallowedCapabilities: "",
  languages: "English",
  num_tests: 12,
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ConfigForm({ onSubmit, loading, assessmentScope }: ConfigFormProps) {
  const [form, setForm] = useState(() => assessmentScope ? {
    ...initialForm,
    use_case: assessmentScope.purpose,
    allowedCapabilities: assessmentScope.allowed.join(", "),
    disallowedCapabilities: assessmentScope.blocked.join(", "),
  } : initialForm);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: ScanConfig = {
      api_url: form.api_url.trim(),
      use_case: form.use_case.trim(),
      allowed_capabilities: splitList(form.allowedCapabilities),
      disallowed_capabilities: splitList(form.disallowedCapabilities),
      languages: splitList(form.languages),
      num_tests: Math.max(1, form.num_tests),
    };

    await onSubmit(payload);
  };

  return (
    <section className="panel config-panel" aria-labelledby="config-title">
      <header className="panel-header">
        <h2 id="config-title">Configuration</h2>
        <p className="panel-subtitle">Define your API scope and run a boundary intent check.</p>
        {assessmentScope && <p className="field-hint">Scope imported from your assessment. This runs a separate IntentScan, not the assessment's multi-step scenarios. Add your endpoint and review before running.</p>}
      </header>

      <form className="form-stack" onSubmit={handleSubmit}>
        <fieldset className="form-section">
          <legend>Target API</legend>
          <div className="field">
            <label htmlFor="api-url">API URL</label>
            <p id="api-url-hint" className="field-hint">
              Public endpoint that accepts prompt-style JSON input.
            </p>
            <input
              id="api-url"
              type="url"
              autoFocus
              required
              aria-describedby="api-url-hint"
              placeholder="https://example.com/ai-endpoint"
              value={form.api_url}
              onChange={(e) => setForm((prev) => ({ ...prev, api_url: e.target.value }))}
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Use Case Definition</legend>
          <div className="field">
            <label htmlFor="use-case">Intended Use Case</label>
            <p id="use-case-hint" className="field-hint">
              Describe what the assistant is expected to do and where it should stop.
            </p>
            <textarea
              id="use-case"
              required
              rows={5}
              aria-describedby="use-case-hint"
              placeholder="Customer support assistant for policy FAQs and order status"
              value={form.use_case}
              onChange={(e) => setForm((prev) => ({ ...prev, use_case: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="allowed-capabilities">Allowed Capabilities</label>
            <p id="allowed-hint" className="field-hint">
              Comma-separated list of in-scope capabilities.
            </p>
            <textarea
              id="allowed-capabilities"
              rows={4}
              aria-describedby="allowed-hint"
              placeholder="answer product FAQs, summarize policy docs"
              value={form.allowedCapabilities}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, allowedCapabilities: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="disallowed-capabilities">Disallowed Capabilities</label>
            <p id="disallowed-hint" className="field-hint">
              Comma-separated list of behavior that must be rejected.
            </p>
            <textarea
              id="disallowed-capabilities"
              rows={4}
              aria-describedby="disallowed-hint"
              placeholder="legal advice, medical diagnosis, account impersonation"
              value={form.disallowedCapabilities}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, disallowedCapabilities: e.target.value }))
              }
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Execution</legend>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="languages">Languages</label>
              <p id="languages-hint" className="field-hint">
                Comma-separated languages for prompt generation.
              </p>
              <input
                id="languages"
                type="text"
                aria-describedby="languages-hint"
                placeholder="English, Spanish"
                value={form.languages}
                onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))}
              />
            </div>

            <div className="field">
              <label htmlFor="num-tests">Number of Tests</label>
              <p id="tests-hint" className="field-hint">
                Total generated probes (1-200).
              </p>
              <input
                id="num-tests"
                type="number"
                min={1}
                max={200}
                aria-describedby="tests-hint"
                value={form.num_tests}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    num_tests: Number.isNaN(Number(e.target.value)) ? 1 : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" disabled={loading} aria-disabled={loading}>
            {loading ? "Running Scan..." : "Run Intent Check"}
          </button>
        </div>
      </form>
    </section>
  );
}
