import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listScans } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function ScanHistory() {
  const { getToken } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    const token = await getToken();
    try { setScans(await listScans(token)); } catch {}
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Scan History</h1>
        <Link to="/app/intentscan" className="button-primary" style={{ fontSize: "0.9rem" }}>New Scan</Link>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : scans.length === 0 ? (
        <div className="panel">
          <p style={{ color: "var(--muted)" }}>No scans yet. <Link to="/app/intentscan" style={{ color: "var(--primary)", fontWeight: 600 }}>Run your first IntentScan</Link>.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Violations</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.scan_id}>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td><span className={s.status === "complete" ? "cell-yes" : s.status === "failed" ? "cell-no" : "cell-warn"}>{s.status}</span></td>
                    <td>{s.summary?.risk_score?.toFixed(1) ?? "—"}</td>
                    <td>{s.summary?.violations ?? "—"}</td>
                    <td><Link to={`/scans/${s.scan_id}`} style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem" }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
