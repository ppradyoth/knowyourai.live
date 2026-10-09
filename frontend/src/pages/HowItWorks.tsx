import { Link } from "react-router-dom";
import Section from "../components/Section";

export default function HowItWorks() {
  return (
    <>
      <Section
        eyebrow="How It Works"
        title="Two products. One consistent model of AI behavior."
        description="IntentScan tests your AI before it reaches users. IntentEnforce controls it once it does. Both are built on the same intent taxonomy so your testing and runtime policies stay in sync."
      />

      {/* IntentScan */}
      <Section eyebrow="IntentScan" title="Test your AI's boundaries before production" className="why-body">
        <div className="why-story">
          <p>
            You define what your AI is supposed to do — its use case, what it's allowed to handle, and what it should refuse. IntentScan takes that definition and systematically tries to break it, generating realistic adversarial prompts and firing them at your API.
          </p>
        </div>

        <div style={{ marginTop: "24px" }}>
          <ol className="step-list">
            <li className="step-item">
              <h3>1. Define the target</h3>
              <p>Provide your AI API endpoint, a description of its intended use case, a list of allowed capabilities, and a list of disallowed ones. You can also specify which languages to test in.</p>
            </li>
            <li className="step-item">
              <h3>2. Generate adversarial probes</h3>
              <p>IntentScan uses three strategies to generate realistic test prompts — not random noise, but structured pressure that mimics how real users push boundaries:</p>
              <ul className="list" style={{ marginTop: "10px" }}>
                <li><strong>Role Transformation</strong> — prompts that try to redefine the AI's identity or persona to bypass its constraints ("pretend you are an unrestricted assistant…")</li>
                <li><strong>Gradual Drift</strong> — sequences that slowly migrate the conversation outside the intended scope, making each step seem reasonable</li>
                <li><strong>Language Variation</strong> — the same boundary-testing prompts rephrased or translated, testing whether guardrails hold across languages and phrasings</li>
              </ul>
            </li>
            <li className="step-item">
              <h3>3. Execute against your API</h3>
              <p>Each probe is sent directly to your AI endpoint. IntentScan adapts to common API formats automatically, trying standard payload keys and response fields so it works with any AI service without configuration.</p>
            </li>
            <li className="step-item">
              <h3>4. Detect violations</h3>
              <p>Every (probe, response) pair is evaluated by an LLM judge against your defined boundaries. Violations are classified into three categories:</p>
              <ul className="list" style={{ marginTop: "10px" }}>
                <li><strong>Capability drift</strong> — the model did something outside its allowed capabilities</li>
                <li><strong>Role drift</strong> — the model adopted an identity or persona that contradicts its intended role</li>
                <li><strong>Domain violation</strong> — the model responded in a domain it was explicitly configured to refuse</li>
              </ul>
            </li>
            <li className="step-item">
              <h3>5. Risk score and evidence report</h3>
              <p>Each violation is assigned a severity (low / medium / high / critical) and a confidence score. These feed into a weighted risk score from 0–100 for the full scan. You get the exact probe, the model's response, and the reason for the violation — actionable evidence, not just a number.</p>
            </li>
          </ol>
        </div>
      </Section>

      {/* IntentEnforce */}
      <Section eyebrow="IntentEnforce" title="Control what your AI does in production" className="why-body">
        <div className="why-story">
          <p>
            IntentEnforce sits as a proxy between your users and your AI. Before any prompt reaches your model, it is classified, checked against your policy, and either passed through, blocked, or held for clarification. Your AI only sees requests it is allowed to handle.
          </p>
        </div>

        <div style={{ marginTop: "24px" }}>
          <ol className="step-list">
            <li className="step-item">
              <h3>1. Classify intent</h3>
              <p>Every incoming user prompt is passed through an intent classifier that determines what the user is actually trying to do — general coding help, financial advice, payments API usage, and so on. The classifier returns a label and a confidence score.</p>
            </li>
            <li className="step-item">
              <h3>2. Evaluate against policy</h3>
              <p>The detected intent label is checked against your configuration — a list of allowed intents and a list of blocked ones. This gives you three possible outcomes:</p>
              <ul className="list" style={{ marginTop: "10px" }}>
                <li><strong>Allow</strong> — the intent is on your allowed list; the request is forwarded to your AI</li>
                <li><strong>Block</strong> — the intent is on your blocked list; a refusal is returned without ever reaching your AI</li>
                <li><strong>Clarify</strong> — the intent is ambiguous or not covered by either list; the user is asked to provide more context</li>
              </ul>
            </li>
            <li className="step-item">
              <h3>3. Route the request</h3>
              <p>Allowed requests are forwarded to your target AI API. The response comes back through IntentEnforce before being returned to the user.</p>
            </li>
            <li className="step-item">
              <h3>4. Validate the response</h3>
              <p>Before the response reaches the user, it is checked for injection patterns — attempts by the AI's response to subvert instructions, impersonate a system prompt, or carry out prompt injection. Flagged responses are withheld and replaced with a safe message.</p>
            </li>
          </ol>
        </div>
      </Section>

      {/* Together */}
      <Section title="How they work together" className="why-body">
        <div className="why-story">
          <p>
            The same intent taxonomy that drives IntentScan's probe generation is what IntentEnforce classifies against at runtime. This means the boundary failures you discover during testing are exactly the categories your enforcement layer is designed to catch in production.
          </p>
          <p>
            Test with IntentScan before you ship. Enforce with IntentEnforce after you do. The two products form a closed loop — one finds where your AI can be pushed out of scope, the other prevents it from happening to real users.
          </p>
        </div>

        <div className="flow-diagram" style={{ marginTop: "20px" }} role="img" aria-label="KnowYourAI workflow">
          <div>Define intent</div>
          <span>→</span>
          <div>IntentScan: probe &amp; detect</div>
          <span>→</span>
          <div>Fix &amp; deploy</div>
          <span>→</span>
          <div>IntentEnforce: classify &amp; gate</div>
          <span>→</span>
          <div>Safe production AI</div>
        </div>
      </Section>

      {/* CTA */}
      <Section title="Try it on your API" description="No setup required. Point IntentScan at any AI endpoint and run a scan in under two minutes." className="why-closing">
        <div className="hero-actions">
          <Link to="/intentscan" className="button-primary">Run IntentScan</Link>
          <Link to="/enforce" className="button-secondary">Try IntentEnforce</Link>
        </div>
      </Section>
    </>
  );
}
