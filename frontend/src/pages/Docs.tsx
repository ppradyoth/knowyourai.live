import { Link } from "react-router-dom";
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

const ciExample = `curl --fail --silent --show-error \\
  --request POST 'https://knowyourai.live/api/scan' \\
  --header "Authorization: Bearer $KYA_API_TOKEN" \\
  --header 'Content-Type: application/json' \\
  --data @scan-request.json \\
  --output scan-submission.json`;

export default function Docs() {
  return (
    <>
      <SEO title="Documentation" description="API integration quickstart for KnowYourAI. Connect your AI endpoint, define behavior boundaries, and run structured scans." path="/docs" />
      <Section
        eyebrow="Docs"
        title="API integration quickstart"
        description="Connect your AI endpoint, define behavior boundaries, and run structured scans."
      />

      <Section heading="h2" title="Quickstart: three steps">
        <ol className="list">
          <li><strong>Connect your account.</strong> <Link to="/login">Sign in</Link> and save your own Claude or Gemini key under <Link to="/account">Account</Link>. Create a platform API key from the <Link to="/dashboard">dashboard</Link> for authenticated API calls.</li>
          <li><strong>Define the boundary and start a scan.</strong> Set the target API URL, use case, allowed and disallowed capabilities, languages and test count. Use the scan request below, with 1–200 tests, and submit it to <code>POST /api/scan</code>.</li>
          <li><strong>Collect the result.</strong> Scans run in the background. The submission returns a scan ID; use it with <code>GET /api/scans/&#123;id&#125;</code> to fetch the scan and <code>GET /api/scans/&#123;id&#125;/report.pdf</code> to download the report.</li>
        </ol>
      </Section>

      <Section heading="h2" title="Authentication">
        <p className="paragraph">The production API base is <code>https://knowyourai.live/api</code>. Send a Firebase ID token or a platform API key in the Authorization header. Platform API keys start with <code>ak_live_</code>; your Claude or Gemini provider key is a separate credential used for model calls.</p>
        <pre>{"Authorization: Bearer <token>"}</pre>
        <p className="paragraph">Every endpoint except <code>/health</code> and <code>/proxy/&#123;layer_id&#125;</code> requires this header. The free plan allows 10 requests per minute and 1,000 tests per month.</p>
      </Section>

      <Section heading="h2" title="POST /scan request format" description="Submit this JSON to /api/scan. The response acknowledges the background scan with an ID; it is not the completed result shown below.">
        <pre>{requestExample}</pre>
      </Section>

      <Section heading="h2" title="Completed scan result example" description="The completed result includes a summary and details for each reported violation.">
        <pre>{responseExample}</pre>
      </Section>

      <Section heading="h2" title="POST /enforce request format" description="Submit this JSON to /api/enforce to classify and route a single prompt using the supplied configuration.">
        <pre>{enforceRequestExample}</pre>
      </Section>

      <Section heading="h2" title="/enforce response format">
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

      <Section heading="h2"
        title="Proxy layer setup"
        description="Create a reusable enforcement layer and point your application at its generated proxy URL."
      >
        <ol className="list">
          <li><Link to="/layers/new">Create a layer</Link> with a target URL, intent categories and policy rules. Layers can also be managed through <code>/api/layers</code> and <code>/api/layers/&#123;id&#125;</code>.</li>
          <li>Copy the layer's generated proxy URL. Your application calls <code>POST /api/proxy/&#123;layer_id&#125;</code>.</li>
          <li>The layer classifies each request and decides <code>allow</code>, <code>block</code> or <code>clarify</code>. Allowed requests are forwarded to the target; the output check can withhold a response.</li>
        </ol>
        <pre>{`Client -> https://knowyourai.live/api/proxy/{layer_id} -> target_api`}</pre>
        <p className="paragraph">Inspect a layer's handled requests with <code>GET /api/layers/&#123;id&#125;/requests</code>.</p>
      </Section>

      <Section heading="h2" title="Submit a scan from CI">
        <p className="paragraph">Save the scan request JSON above as <code>scan-request.json</code>, with your target URL and capability boundaries. Supply <code>KYA_API_TOKEN</code> from your CI secret store using a platform API key or Firebase ID token. The account must already have its provider key configured.</p>
        <pre>{ciExample}</pre>
        <p className="paragraph">Keep <code>scan-submission.json</code> as the submission record. This command fails on an HTTP error and saves a successful submission; it does not wait for completion or apply a security pass/fail threshold. A successful submission is not a passing scan.</p>
      </Section>

      <Section heading="h2" title="Integration details still to confirm">
        <ul className="list">
          <li>The exact scan submission JSON field for the ID, and the completion/status fields needed for automated polling.</li>
          <li>The target endpoint's request, response and authentication contract, and its mapping through a proxy layer.</li>
          <li>The completed-result checks and pass/fail policy required before CI can gate a release.</li>
        </ul>
      </Section>
    </>
  );
}
