import Card from "../components/Card";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Security() {
  return (
    <>
      <SEO title="Security" description="How KnowYourAI handles your account, your model API key and your scan data, and what it does not claim." path="/security" />
      <Section
        eyebrow="Security"
        title="What we do with your data, exactly"
        description="A security company should be specific about its own. This is how the hosted platform works today, and what it does not have."
      />

      <Section title="Your model API key">
        <div className="card-grid three-col">
          <Card title="Encrypted before storage" description="Your model key is encrypted with AES-256-GCM and bound to your account, so a ciphertext copied to another account does not decrypt." />
          <Card title="Never sent back" description="After you save it, the browser only ever receives the last four characters. You can replace or remove it at any time." />
          <Card title="Used only for your runs" description="The key is decrypted in memory for your own scans and enforcement calls. We do not make model calls on a shared key." />
        </div>
      </Section>

      <Section title="The platform">
        <ul className="list">
          <li>Sign-in is handled by Firebase Authentication, with Google or email and password.</li>
          <li>The database is closed to browsers. Scans, layers and keys are reachable only through the backend, which checks that they belong to you.</li>
          <li>A proxy layer URL works for anyone who has it and spends your model quota. Treat it like a secret.</li>
          <li>Target URLs are resolved and checked before any outbound request, and loopback, private and link-local addresses are rejected.</li>
          <li>Per-account rate limits and a monthly test quota apply.</li>
          <li>The command-line tools are static and run on your machine. They need no account and no key.</li>
        </ul>
      </Section>

      <Section title="What we do not have" description="So you can decide with accurate information.">
        <ul className="list">
          <li>No SOC 2 or ISO 27001 report.</li>
          <li>No single sign-on, role-based access or audit-log export.</li>
          <li>No uptime commitment. The hosted platform is free and provided as is.</li>
          <li>Scan results include the prompts sent to your endpoint and its responses. Do not point scans at systems that return data you cannot store with a third party.</li>
        </ul>
      </Section>
    </>
  );
}
