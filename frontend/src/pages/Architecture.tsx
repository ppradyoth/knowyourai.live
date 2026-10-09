import Card from "../components/Card";
import Section from "../components/Section";

export default function Architecture() {
  return (
    <>
      <Section
        eyebrow="Architecture"
        title="Composable architecture for AI behavior QA"
        description="KnowYourAI separates configuration, scan execution, and violation analysis for reliability and extensibility."
      />

      <Section title="System modules">
        <div className="card-grid three-col">
          <Card title="Constraint Builder" description="Normalizes use-case policy inputs into a consistent scanning contract." />
          <Card title="Probe Orchestrator" description="Schedules test generation and API execution per strategy and language." />
          <Card title="Detection Engine" description="Evaluates outputs and emits deterministic structured findings." />
        </div>
      </Section>

      <Section title="Deployment pattern">
        <p className="paragraph">
          The frontend runs as a React SPA. The FastAPI backend handles scan orchestration, target API communication,
          and violation detection. Teams can deploy behind private network boundaries with standard observability hooks.
        </p>
      </Section>
    </>
  );
}
