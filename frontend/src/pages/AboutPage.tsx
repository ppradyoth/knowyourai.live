export default function AboutPage() {
  return (
    <div className="page-stack">
      <section className="panel soft-panel">
        <p className="eyebrow">About</p>
        <h1>Helping teams ship safer AI experiences.</h1>
      </section>

      <section className="panel prose">
        <p>
          KnowYourAI was built to solve one core problem: AI systems can gradually drift beyond their intended role.
          Our mission is to give product and risk teams a fast, clear way to detect that drift early.
        </p>
      </section>
    </div>
  );
}
