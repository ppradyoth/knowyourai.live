import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Signup() {
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
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ maxWidth: 440, margin: "0 auto", paddingTop: 64 }}>
      <div className="panel">
        <div className="panel-header">
          <h2>Create account</h2>
          <p className="panel-subtitle">Start red-teaming your AI systems</p>
        </div>
        <GoogleSignIn label="Sign up with Google" />
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
          </div>
        </form>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}
