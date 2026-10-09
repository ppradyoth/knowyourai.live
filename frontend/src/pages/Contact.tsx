import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Contact() {
  return (
    <>
      <SEO title="Contact" description="Get in touch with KnowYourAI for AI security assessments, architecture reviews, and enterprise onboarding." path="/contact" />
      <Section
        eyebrow="Contact"
        title="Talk to product, security, or sales"
        description="Our team supports evaluations, architecture reviews, and enterprise onboarding."
      />

      <Section title="Get in touch">
        <div className="card-grid two-col">
          <article className="card">
            <h3>Request an Assessment</h3>
            <p className="card-description">Fill out our assessment form and we'll schedule a scoping call within 1-2 business days.</p>
            <a href="/request" style={{ display: "inline-block", marginTop: 12, fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)" }}>Request Assessment →</a>
          </article>
          <article className="card">
            <h3>Response Time</h3>
            <p className="card-description">Within one business day for all inquiries.</p>
          </article>
        </div>
      </Section>
    </>
  );
}
