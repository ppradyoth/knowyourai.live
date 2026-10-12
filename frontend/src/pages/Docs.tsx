import Section from "../components/Section";
import SEO from "../components/SEO";

const requestExample = `{
  "api_url": "https://example.com/assistant",
  "use_case": "Support assistant for account FAQs",
  "allowed_capabilities": ["faq answers", "policy summaries"],
  "disallowed_capabilities": ["financial advice", "identity spoofing"],
  "languages": ["English", "Spanish"],
  "num_tests": 12
}`;

const responseExample = `{
  "summary": {
    "total_tests": 12,
    "violations": 3,
    "risk_score": 28.7
  },
  "violations": [
    {
      "strategy": "GradualDrift",
      "prompt": "...",
      "response": "...",
      "analysis": {
        "violation": true,
        "type": "role_drift",
        "severity": "medium",
        "reason": "Assistant accepted unauthorized role",
        "confidence": 0.84
      }
    }
  ]
}`;

const enforceRequestExample = `{
  "prompt": "Can you help me design a backend service?",
  "target_api": "https://example.com/ai-endpoint",
  "config": {
    "allowed": ["payments_api_help", "sdk_usage"],
    "blocked": ["financial_advice", "general_coding"]
  }
}`;

const enforceResponseExample = `{
  "intent": {
    "label": "general_coding",
    "confidence": 0.82
  },
  "decision": "block",
  "response": "I cannot help with that request in this context.",
  "validation": {
    "safe": true
  }
}`;

export default function Docs() {
  return (
    <>
      <SEO title="Documentation" description="API integration quickstart for KnowYourAI. Connect your AI endpoint, define behavior boundaries, and run structured scans." path="/docs" />
      <Section
        eyebrow="Docs"
        title="API integration quickstart"
        description="Connect your AI endpoint, define behavior boundaries, and run structured scans."
      />

      <Section title="POST /scan request format">
        <pre>{requestExample}</pre>
      </Section>

      <Section title="Response format">
        <pre>{responseExample}</pre>
      </Section>

      <Section title="POST /enforce request format">
        <pre>{enforceRequestExample}</pre>
      </Section>

      <Section title="/enforce response format">
        <pre>{enforceResponseExample}</pre>
      </Section>

      <section className="section">
        <header className="section-header"><h2>POST /assessments/plan</h2><p className="section-description">Generate a draft plan using the model key saved under Account. Authenticate with a Firebase bearer token or your KnowYourAI API key.</p></header>
        <pre>{JSON.stringify({ name: "Support assistant", purpose: "Answer account questions and prepare changes for customer approval.", allowed: ["answer account questions"], blocked: ["change accounts without approval"], scenario_count: 6, sources: [{ id: "policy", name: "policy.md", kind: "knowledge", content: "Every account change requires explicit customer approval." }] }, null, 2)}</pre>
        <p className="paragraph">The response contains a draft plan, source SHA-256 hashes, trust boundaries, prioritized scenarios, exact source references, legitimate controls and grading criteria. execution_status is always not_run. Invalid source references cause generation to fail, rather than returning an unsupported plan.</p>
        <p className="paragraph">Use 1–24 sources, at most 60,000 characters each and 120,000 combined, at most 4,000 lines per source and 8,000 combined, with 3–12 scenarios. Source kinds are report, knowledge, code and trace. Sources may include role, trust_level, tested_system, tested_version, assessment_date (YYYY-MM-DD), finding_status and notes. These are supplied context, not independent verification.</p>
        <p className="paragraph">The context object accepts application_type, models, user_roles, workflow, entry_points, data_access, memory_and_handoffs, environment, observable_outcomes and tools. Each tool describes name, purpose, effect, identity_scope, approval and constraints. Unspecified details remain unknown. The response echoes context and preserves source metadata in its manifest. This feature does not save sources or plans; generation sends them to your configured provider.</p>
        <h3 style={{ marginTop: 24 }}>POST /assessments/extract-pdf</h3><p className="paragraph">Send PDF bytes with Content-Type: application/pdf and the same authentication. Returns extracted content for review before planning. Maximum 2 MB and 40 pages. Encrypted PDFs, image-only PDFs and extracted text over 60,000 characters are rejected.</p>
      </section>

      <Section
        title="Proxy integration"
        description="Route production traffic through the KnowYourAI enforcement layer before it reaches your target model endpoint."
      >
        <pre>{`Client -> https://api.example.com/proxy/{layer_id} -> target_api`}</pre>
      </Section>
    </>
  );
}
