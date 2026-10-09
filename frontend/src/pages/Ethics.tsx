import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Ethics() {
  return (
    <>
      <SEO title="Responsible Disclosure & Ethics" description="KnowYourAI's principles for responsible AI security evaluation and ethical disclosure." path="/ethics" />
      <Section eyebrow="Ethics" title="Responsible Disclosure & Ethics Policy" description="Last updated: June 2026" />

      <section className="section">
        <div style={{ maxWidth: "72ch", margin: "0 auto" }} className="prose-legal">

        <h2>1. Our Principles</h2>
        <p>KnowYourAI conducts AI security assessments and adversarial testing with a commitment to ethical practices, responsible disclosure, and the advancement of AI safety. Our work is guided by the following principles:</p>
        <ul>
          <li><strong>Authorization first:</strong> We only test systems with explicit written authorization from the system owner or authorized representative</li>
          <li><strong>Proportionality:</strong> Our testing methods are proportionate to the engagement scope and designed to minimize unintended impact</li>
          <li><strong>Transparency:</strong> We clearly communicate our methodologies, findings, and limitations to clients</li>
          <li><strong>Human oversight:</strong> Final risk decisions and remediation priorities remain with responsible human stakeholders, not automated scoring alone</li>
          <li><strong>Harm reduction:</strong> We prioritize scenarios with real-world impact potential, focusing on safety-critical and abuse-prone behaviors</li>
          <li><strong>Privacy respect:</strong> We handle all data encountered during assessments with strict confidentiality and in accordance with our Privacy Policy</li>
        </ul>

        <h2>2. Responsible Disclosure</h2>
        <p>When our research identifies vulnerabilities in third-party products or services, we follow responsible disclosure practices:</p>
        <ul>
          <li>We notify the affected vendor or organization before any public disclosure</li>
          <li>We provide reasonable time for the vendor to investigate and remediate before public disclosure</li>
          <li>We do not exploit discovered vulnerabilities beyond what is necessary to demonstrate the issue</li>
          <li>We work with vendors and bug bounty programs where available</li>
          <li>Public disclosures focus on advancing security knowledge and are presented with appropriate context</li>
        </ul>

        <h2>3. Client Engagement Ethics</h2>
        <p>In client engagements, we adhere to the following standards:</p>
        <ul>
          <li>We operate strictly within the authorized scope defined in the engagement agreement</li>
          <li>We do not access, exfiltrate, or retain data beyond what is necessary for the assessment</li>
          <li>We report all findings to the client, including findings that may be inconvenient or unfavorable</li>
          <li>We do not misrepresent our findings or inflate severity to drive additional business</li>
          <li>We maintain strict confidentiality of all client data, systems, and findings</li>
        </ul>

        <h2>4. Research Ethics</h2>
        <p>Our published research and case studies:</p>
        <ul>
          <li>Are based on authorized testing or publicly accessible systems</li>
          <li>Do not disclose information that could enable exploitation of unpatched vulnerabilities</li>
          <li>Are reviewed for accuracy and responsible framing before publication</li>
          <li>Credit relevant prior work and acknowledge limitations</li>
        </ul>

        <h2>5. Limitations</h2>
        <p>We acknowledge that:</p>
        <ul>
          <li>No security assessment can identify all possible vulnerabilities</li>
          <li>The absence of findings does not guarantee the security of a system</li>
          <li>AI systems evolve continuously, and findings are a point-in-time snapshot</li>
          <li>Our recommendations are advisory and do not constitute legal, regulatory, or compliance certification</li>
        </ul>

        <h2>6. Reporting Concerns</h2>
        <p>If you believe that KnowYourAI or any individual acting on behalf of KnowYourAI has engaged in conduct inconsistent with these principles, please contact us through the information provided on our website.</p>

        </div>
      </section>
    </>
  );
}
