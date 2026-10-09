import Section from "../components/Section";
import SEO from "../components/SEO";

export default function About() {
  return (
    <>
      <SEO
        title="About"
        description="KnowYourAI builds open-source tools, a testing and enforcement platform, and runs assessments so teams know what their AI does in production."
        path="/about"
      />
      <Section
        eyebrow="About"
        title="Our mission is trustworthy AI behavior at scale"
        description="KnowYourAI exists so that anyone shipping AI can know what it is, how it behaves under attack, and what it is doing right now."
      />

      <Section title="Vision" description="Every AI release should include measurable behavior assurance by default.">
        <p className="paragraph">
          We are building the quality and risk infrastructure layer for AI products so teams can move quickly without
          sacrificing security, compliance, or customer trust.
        </p>
      </Section>

      <Section title="Where we are" description="Stated plainly, because a security company should be.">
        <ul className="list">
          <li>Bootstrapped and independent. No outside funding and no revenue yet.</li>
          <li>Open source first: the scanners, benchmarks and labs are public and free to use.</li>
          <li>The hosted platform is free and runs on each user's own model key, so it costs nothing to try.</li>
          <li>Built with Claude Code.</li>
        </ul>
      </Section>

      <Section title="Why now?" description="">
        <div className="mt-8 space-y-6 text-gray-700">
          <p>
            Large language models are being deployed into production at an unprecedented pace. Teams are moving fast,
            shipping new features weekly. But there's a critical gap: no systematic way to verify that models stay
            within their intended boundaries.
          </p>
          <p>
            We've seen the consequences: compliance violations, customer trust erosion, and costly incident response.
          </p>
          <p>
            KnowYourAI was born to fill that gap. We're building the testing and enforcement layer that lets teams move
            fast <strong>and</strong> confidently.
          </p>
        </div>
      </Section>
    </>
  );
}
