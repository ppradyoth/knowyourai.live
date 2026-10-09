import { useNavigate } from "react-router-dom";

export default function WhatsUnique() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 24px", lineHeight: 1.7 }}>

      {/* Hero */}
      <section style={{ marginBottom: "80px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
          WHAT MAKES KNOWYOURAI DIFFERENT
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, lineHeight: 1.15, color: "var(--text)", marginBottom: "24px" }}>
          What's Actually Unique About KnowYourAI?
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--muted)", maxWidth: "600px" }}>
          Not another layer on top of AI. A new control layer within it.
        </p>
      </section>

      {/* Not Just Another Tool */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "32px" }}>
          Not More of the Same
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          {[
            { old: "More prompts", newThing: "Understanding intent" },
            { old: "More filters", newThing: "Controlling decisions" },
            { old: "More benchmarks", newThing: "Testing real behavior" },
          ].map(({ old, newThing }) => (
            <div key={old} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "24px" }}>
              <p style={{ color: "var(--muted)", textDecoration: "line-through", marginBottom: "8px", fontSize: "0.95rem" }}>{old}</p>
              <p style={{ color: "var(--primary-strong)", fontWeight: 700, fontSize: "1rem" }}>→ {newThing}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Existing Approaches Fall Short */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
          Why Existing Approaches Fall Short
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "32px" }}>
          The tools that exist today were built for a simpler problem.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {[
            { name: "Red Teaming", what: "Adversarial prompts crafted by humans to find known vulnerabilities.", limit: "Point-in-time. Manual. Covers what testers think to try — not what attackers actually do." },
            { name: "Evals", what: "Benchmark scores against static datasets to measure model capability.", limit: "Offline. Measures outputs, not compliance. A model can pass every eval and still violate boundaries in production." },
            { name: "Runtime Guardrails", what: "Input/output filters that block or modify text matching defined patterns.", limit: "Reactive. Operates after the model has already processed the request. Pattern matching is trivially bypassed with indirect phrasing." },
            { name: "Policy Layers", what: "Rules authored to define what the system should or shouldn't do.", limit: "Rules are defined but enforced at the wrong layer — on text, not on decisions. A policy that says 'no financial advice' cannot catch obfuscated financial advice." },
          ].map(({ name, what, limit }) => (
            <div key={name} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "24px", background: "var(--surface)" }}>
              <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>{name}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "8px" }}>{what}</p>
              <p style={{ color: "var(--danger)", fontSize: "0.9rem", fontStyle: "italic" }}>↳ {limit}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--text)", borderRadius: "10px", padding: "24px", marginBottom: "20px" }}>
          <p style={{ color: "var(--surface-2)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "8px" }}>
            These approaches secure responses. They do not control behavior.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            All four are prompt- or output-centric. None operate at the decision layer. None understand intent. All assume single-step interactions. All can be bypassed through multi-step or indirect attacks.
          </p>
        </div>
        <p style={{ color: "var(--primary-strong)", fontWeight: 600 }}>
          This is where KnowYourAI is fundamentally different — it operates at the layer where decisions are made.
        </p>
      </section>

      {/* Intent-First Architecture */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "16px" }}>
          Intent-First Architecture
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Every other tool starts with text. KnowYourAI starts with intent.
        </p>
        <div style={{ borderLeft: "4px solid var(--primary-strong)", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ color: "var(--text)" }}>
            <strong>Every request is treated as intent, not text.</strong> Before the model sees anything, KnowYourAI has already classified what the user actually wants to do.
          </p>
          <p style={{ color: "var(--text)" }}>
            <strong>Intent is classified before model execution.</strong> The decision of whether to allow, block, or redirect is made upstream — not downstream in the response.
          </p>
          <p style={{ color: "var(--text)" }}>
            <strong>Policies are enforced at the decision layer.</strong> Not at the input. Not at the output. At the moment the system decides what to do.
          </p>
        </div>
        <div style={{ marginTop: "32px", background: "var(--primary-soft)", border: "1px solid var(--primary-border)", borderRadius: "10px", padding: "24px" }}>
          <p style={{ fontWeight: 700, color: "var(--primary-strong)", fontSize: "1.1rem" }}>
            Control happens before the model acts.
          </p>
        </div>
      </section>

      {/* System-Level, Not Model-Level */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "16px" }}>
          System-Level, Not Model-Level
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Most tools evaluate what a model says. KnowYourAI controls what the system does.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger-border)", borderRadius: "10px", padding: "24px" }}>
            <p style={{ fontWeight: 700, color: "var(--danger)", marginBottom: "12px" }}>Other Tools</p>
            <ul style={{ color: "var(--muted)", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Evaluate a single model response</li>
              <li>Work on isolated prompts</li>
              <li>Can't see across API calls</li>
              <li>Blind to multi-step workflows</li>
            </ul>
          </div>
          <div style={{ background: "var(--success-soft)", border: "1px solid var(--success-border)", borderRadius: "10px", padding: "24px" }}>
            <p style={{ fontWeight: 700, color: "var(--success)", marginBottom: "12px" }}>KnowYourAI</p>
            <ul style={{ color: "var(--muted)", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Controls system-level behavior</li>
              <li>Covers full interaction sequences</li>
              <li>Operates across API calls</li>
              <li>Understands multi-step workflows</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Continuous Boundary Testing */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "16px" }}>
          Continuous Boundary Testing
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "8px" }}>
          Static test cases — like evals and red teaming — break as soon as attackers adapt. IntentScan doesn't.
        </p>
        <p style={{ fontWeight: 700, color: "var(--primary-strong)", marginBottom: "24px", fontSize: "1.1rem" }}>
          "Real attacks don't happen in one prompt."
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { label: "Evolving attack scenarios", desc: "Not a fixed dataset — generates novel adversarial cases tuned to your system's specific constraints and disallowed behaviors." },
            { label: "Multi-strategy coverage", desc: "Tests RoleTransformation, GradualDrift, and LanguageVariation in parallel — covering the full surface of how real users probe boundaries." },
            { label: "Sequence-aware testing", desc: "Tests how systems behave across interaction sequences, not just single-shot prompts. Catches drift that only emerges over multiple turns." },
          ].map(({ label, desc }) => (
            <div key={label} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--primary-strong)", fontWeight: 900, fontSize: "1.25rem", lineHeight: 1.5, flexShrink: 0 }}>→</span>
              <div>
                <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{label}</p>
                <p style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Decision-Layer Enforcement */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "16px" }}>
          Decision-Layer Enforcement
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Unlike guardrails — which sit after the model and filter output — IntentEnforce sits before it, as a proxy that controls execution.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { step: "1", text: "Request arrives" },
            { step: "→", text: "Intent is classified", highlight: true },
            { step: "→", text: "Policy is evaluated", highlight: true },
            { step: "→", text: "Decision: Allow / Block / Redirect", highlight: true },
            { step: "→", text: "Model executes (only if allowed)" },
          ].map(({ step, text, highlight }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: "16px", padding: "14px 20px",
              background: highlight ? "var(--primary-soft)" : "var(--surface-2)",
              border: "1px solid " + (highlight ? "var(--primary-border)" : "var(--border)"),
              borderRadius: "8px", marginBottom: "4px"
            }}>
              <span style={{ fontWeight: 900, color: highlight ? "var(--primary-strong)" : "var(--muted)", minWidth: "24px" }}>{step}</span>
              <span style={{ color: highlight ? "var(--primary-strong)" : "var(--muted)", fontWeight: highlight ? 600 : 400 }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "24px", background: "var(--text)", borderRadius: "10px", padding: "24px" }}>
          <p style={{ color: "var(--primary-border)", fontWeight: 700, fontSize: "1.05rem" }}>
            It doesn't just filter output. It controls execution.
          </p>
        </div>
      </section>

      {/* Why This Is Different */}
      <section style={{ marginBottom: "80px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text)", marginBottom: "24px" }}>
          What This Means in Practice
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            "Works before, during, and after execution — not just one phase",
            "Understands intent, not just text — can't be bypassed by rephrasing",
            "Controls systems, not just models — covers your entire AI surface",
            "Handles multi-step interactions — catches drift across turns, not just single responses",
            "Built for real-world AI agents — not research benchmarks, not single-shot prompts",
          ].map((item) => (
            <div key={item} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--surface-2)" }}>
              <span style={{ color: "var(--success)", fontWeight: 900, flexShrink: 0 }}>✓</span>
              <span style={{ color: "var(--text)" }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section style={{ borderTop: "2px solid var(--primary-strong)", paddingTop: "48px", textAlign: "center" }}>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--muted)", marginBottom: "12px" }}>
          AI security today reacts.
        </p>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-strong)", marginBottom: "40px" }}>
          KnowYourAI controls.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/intentscan")}
            style={{ padding: "14px 32px", background: "var(--primary-strong)", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          >
            Run IntentScan
          </button>
          <button
            onClick={() => navigate("/enforce")}
            style={{ padding: "14px 32px", background: "white", color: "var(--primary-strong)", border: "2px solid var(--primary-strong)", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
          >
            Try IntentEnforce
          </button>
        </div>
      </section>

    </div>
  );
}
