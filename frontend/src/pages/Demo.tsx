import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfigForm from "../components/ConfigForm";
import ResultsPanel from "../components/ResultsPanel";
import Section from "../components/Section";
import { submitScan, pollScan } from "../api";
import { useAuth } from "../hooks/useAuth";
import type { ScanConfig, ScanResponse } from "../types";

export default function Demo() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleRunScan = async (config: ScanConfig) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const token = await getToken();
      const submission = await submitScan(config, token);

      if (submission.status === "complete") {
        setResult(submission as unknown as ScanResponse);
      } else {
        setStatus(`Scan queued (${submission.scan_id.slice(0, 8)}...). Waiting for results...`);
        const scanResult = await pollScan(submission.scan_id, token);
        if (scanResult.status === "failed") {
          setError("Scan failed. Please try again.");
          setResult(null);
        } else {
          setResult(scanResult as ScanResponse);
          navigate(`/scans/${submission.scan_id}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete scan. Please try again.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  return (
    <>
      <Section
        eyebrow="Intent Scan"
        title="Run behavior scans against your AI API"
        description="Use the production scan workflow to generate tests, execute probes, and review violation evidence."
      />

      <section className="section">
        <div className="workspace-grid" aria-label="Scan workspace">
          <ConfigForm onSubmit={handleRunScan} loading={loading} />
          {status && (
            <div style={{ padding: "1rem", background: "var(--clr-surface, var(--text))", borderRadius: 8, marginBottom: "1rem", textAlign: "center", color: "var(--clr-accent, #00d4aa)" }}>
              {status}
            </div>
          )}
          <ResultsPanel result={result} loading={loading} error={error} />
        </div>
      </section>
    </>
  );
}
