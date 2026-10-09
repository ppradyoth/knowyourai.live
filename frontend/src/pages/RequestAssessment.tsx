import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function RequestAssessment() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await addDoc(collection(db, "assessment_requests"), {
        name: data.get("name"),
        email: data.get("email"),
        company: data.get("company"),
        system_description: data.get("system_description"),
        concerns: data.get("concerns"),
        service: data.get("service"),
        timeline: data.get("timeline"),
        created_at: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again in a few minutes.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
      <SEO title="Request Received" description="Your AI security assessment request has been received. We'll respond within 1-2 business days." path="/request" />
      <Section className="hero-section">
        <div className="panel" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 40 }}>
          <h1 style={{ marginBottom: 12 }}>Request received</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
            We'll review your submission and get back to you within 1-2 business days to schedule a scoping call.
          </p>
        </div>
      </Section>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Request an AI Security Assessment"
        description="Tell us about your AI system and get expert adversarial testing. We respond within 1-2 business days with a scoping call."
        path="/request"
      />
      <Section
        title="Request an assessment"
        description="Tell us about your AI system. We'll scope the engagement and get back to you within 1-2 business days."
        className="hero-section"
      />

      <Section>
        <div className="panel" style={{ maxWidth: 620, margin: "0 auto" }}>
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field">
              <label>Your name</label>
              <input type="text" name="name" required placeholder="Jane Smith" />
            </div>
            <div className="field">
              <label>Work email</label>
              <input type="email" name="email" required placeholder="jane@company.com" />
            </div>
            <div className="field">
              <label>Company</label>
              <input type="text" name="company" required placeholder="Acme Corp" />
            </div>
            <div className="field">
              <label>What does your AI system do?</label>
              <textarea name="system_description" required placeholder="e.g. Customer support chatbot powered by GPT-4, handles billing questions and account changes. Deployed on our website, ~10k conversations/day." />
              <p className="field-hint">The more detail you provide, the faster we can scope the engagement.</p>
            </div>
            <div className="field">
              <label>What are you most concerned about?</label>
              <textarea name="concerns" placeholder="e.g. We're worried about prompt injection through customer messages. We also accept file uploads and aren't sure if those are safe." />
            </div>
            <div className="field">
              <label>Which service are you interested in?</label>
              <select name="service" required style={{ appearance: "auto", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", color: "var(--text)", fontSize: "1rem", width: "100%" }}>
                <option value="">Select one</option>
                <option value="AI Red-Team Assessment">AI Red-Team Assessment</option>
                <option value="Document & RAG Injection Audit">Document & RAG Injection Audit</option>
                <option value="Ongoing Red-Team Retainer">Ongoing Red-Team Retainer</option>
                <option value="Not sure">Not sure — help me decide</option>
              </select>
            </div>
            <div className="field">
              <label>Timeline</label>
              <select name="timeline" style={{ appearance: "auto", padding: "11px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", color: "var(--text)", fontSize: "1rem", width: "100%" }}>
                <option value="">Select one</option>
                <option value="ASAP">ASAP — we're launching soon</option>
                <option value="Within the next month">Within the next month</option>
                <option value="This quarter">This quarter</option>
                <option value="Just exploring">Just exploring</option>
              </select>
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
            <div className="form-actions">
              <button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit Request"}</button>
            </div>
            <p className="field-hint" style={{ textAlign: "center" }}>
              We'll respond within 1-2 business days. No sales calls — just a scoping conversation.
            </p>
          </form>
        </div>
      </Section>
    </>
  );
}
