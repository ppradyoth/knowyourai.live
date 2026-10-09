import Section from "../components/Section";

export default function Why() {
  return (
    <>
      <Section
        eyebrow="Why KnowYourAI"
        title="AI doesn't break the way you think."
        description="Most AI systems don't fail because of attacks. They fail because they quietly stop behaving as intended."
        className="why-hero"
      >
        <p className="why-hero-note">
          The most expensive failures are rarely dramatic. They are gradual, normalized, and often invisible until trust is already eroded.
        </p>
      </Section>

      <Section title="A pattern we kept seeing" className="why-body">
        <div className="why-story">
          <p>
            A team launches a domain-specific chatbot. It is designed for one clear job, like handling support requests,
            helping customers complete tasks, or answering policy questions.
          </p>
          <p>
            Then usage shifts. People begin asking unrelated questions, pushing the assistant beyond its intended purpose,
            and relying on it like a general-purpose AI system.
          </p>
          <p>
            The assistant responds anyway. No hard boundary. No reliable refusal. What was meant to be focused quietly
            turns into an ungoverned free-form model experience.
          </p>
        </div>
      </Section>

      <Section title="This isn't misuse. It's drift." className="why-body">
        <div className="why-story">
          <p>
            AI systems do not naturally enforce intent boundaries over time. Behavior expands through edge cases,
            ambiguous prompts, and repeated user pressure.
          </p>
          <p>
            Eventually, the system becomes something it was never designed to be. Not because one person attacked it,
            but because nobody measured whether it stayed aligned to its purpose.
          </p>
        </div>
      </Section>

      <Section title="Why this matters" className="why-body">
        <div className="why-risk-grid">
          <article className="card why-risk-card">
            <h3>Cost leakage</h3>
            <p className="card-description">Users consume compute for out-of-scope use, turning targeted systems into unintended free LLM channels.</p>
          </article>
          <article className="card why-risk-card">
            <h3>Compliance exposure</h3>
            <p className="card-description">Assistants can provide responses that exceed policy, legal, or regulatory boundaries.</p>
          </article>
          <article className="card why-risk-card">
            <h3>Unpredictable behavior</h3>
            <p className="card-description">Product teams lose confidence in what the AI will do across real-world conversations.</p>
          </article>
          <article className="card why-risk-card">
            <h3>Trust breakdown</h3>
            <p className="card-description">Customers and internal stakeholders stop trusting the product's consistency and intent.</p>
          </article>
        </div>
      </Section>

      <Section title="The gap" className="why-body">
        <div className="why-story">
          <p>
            Most AI assurance tooling is built around attacks and perimeter security. That work is essential, but it does
            not answer the question product teams face every day:
          </p>
          <p className="why-highlight">Is this system behaving correctly for its purpose?</p>
        </div>
      </Section>

      <Section title="KnowYourAI ensures your AI behaves as intended." className="why-body">
        <div className="why-story">
          <p>
            KnowYourAI uses use-case-driven testing to evaluate real behavior against declared scope. It validates boundaries,
            identifies where drift has started, and turns ambiguous risk into structured evidence.
          </p>
          <p>
            The result is simple: you decide what your AI should be, and you can prove whether it still is.
          </p>
          <p className="why-highlight">This is why testing is not enough. You need enforcement.</p>
        </div>
      </Section>

      <Section title="AI shouldn't decide what it becomes. You should." className="why-closing" />
    </>
  );
}
