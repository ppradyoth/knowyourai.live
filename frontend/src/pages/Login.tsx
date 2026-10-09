import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ maxWidth: 440, margin: "0 auto", paddingTop: 64 }}>
      <div className="panel">
        <div className="panel-header">
          <h2>Sign in</h2>
          <p className="panel-subtitle">Access your KnowYourAI dashboard</p>
        </div>
        <GoogleSignIn label="Continue with Google" />
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          </div>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
          Don't have an account? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </section>
  );
}
