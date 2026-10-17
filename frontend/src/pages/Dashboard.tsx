import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { getUsage, listScans, listLayers } from "../api";

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<{ plan: string; monthly_tests_used: number; monthly_tests_limit: number } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [layerCount, setLayerCount] = useState(0);

  const fetchData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [u, scans, layers] = await Promise.all([getUsage(token), listScans(token), listLayers(token)]);
      setUsage(u);
      setRecentScans(scans.slice(0, 5));
      setLayerCount(layers.length);
    } catch {}
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const usagePct = usage ? Math.min(100, (usage.monthly_tests_used / usage.monthly_tests_limit) * 100) : 0;

  return (
    <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/account" className="button-secondary" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>Account</Link>
          <button onClick={handleSignOut} className="button-secondary" style={{ fontSize: "0.85rem", padding: "6px 14px", width: "auto" }}>Sign out</button>
        </div>
      </div>

      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{user?.email}</p>

      {usage && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700 }}>Monthly Usage</span>
            <span className="eyebrow" style={{ margin: 0, textTransform: "capitalize" }}>{usage.plan} plan</span>
          </div>
          <div className="progress-track" style={{ animation: "none" }}>
            <div style={{
              width: `${usagePct}%`,
              height: "100%",
              borderRadius: "inherit",
              background: usagePct > 80 ? "var(--danger)" : "var(--primary)",
              transition: "width 0.3s",
            }} />
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>
            {usage.monthly_tests_used.toLocaleString()} / {usage.monthly_tests_limit.toLocaleString()} tests used
          </p>
        </div>
      )}

      <div className="card-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 32 }}>
        <ActionCard to="/app/intentscan" label="New Scan" sub="Run IntentScan" />
        <ActionCard to="/scans" label="History" sub={`${recentScans.length}+ scans`} />
        <ActionCard to="/layers" label="Layers" sub={`${layerCount} active`} />
        <ActionCard to="/app/enforce" label="Enforce" sub="Test playground" />
      </div>

      <div className="panel" style={{ marginBottom: 32 }}>
        <p className="eyebrow">Assessment Intelligence · Preview</p>
        <h2>Build the assessment before you run the tests.</h2>
        <p className="paragraph">Use previous reports, knowledge-base documents and source files to plan prioritized scenarios with source references and legitimate controls.</p>
        <Link to="/assessment" className="button-primary" style={{ marginTop: 16 }}>Build an assessment</Link>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent Scans</h2>
        </div>
        {recentScans.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No scans yet. <Link to="/app/intentscan" style={{ color: "var(--primary)", fontWeight: 600 }}>Run your first scan</Link>.</p>
        ) : (
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
                {recentScans.map((s) => (
                  <tr key={s.scan_id}>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={s.status === "complete" ? "cell-yes" : s.status === "failed" ? "cell-no" : "cell-warn"}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.summary?.risk_score?.toFixed(1) ?? "—"}</td>
                    <td>{s.summary?.violations ?? "—"}</td>
                    <td><Link to={`/scans/${s.scan_id}`} style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem" }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ActionCard({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link to={to} className="card" style={{ textAlign: "center", textDecoration: "none" }}>
      <h3 style={{ fontSize: "1.05rem" }}>{label}</h3>
      <p className="card-description" style={{ fontSize: "0.82rem" }}>{sub}</p>
    </Link>
  );
}
