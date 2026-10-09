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

      <Section
        title="Proxy integration"
        description="Route production traffic through the KnowYourAI enforcement layer before it reaches your target model endpoint."
      >
        <pre>{`Client -> https://api.example.com/proxy/{layer_id} -> target_api`}</pre>
      </Section>
    </>
  );
}
