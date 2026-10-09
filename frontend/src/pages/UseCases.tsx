import Card from "../components/Card";
import Section from "../components/Section";

export default function UseCases() {
  return (
    <>
      <Section
        eyebrow="Use Cases"
        title="Where KnowYourAI delivers immediate value"
        description="Behavior QA for regulated, customer-facing, and mission-critical AI experiences."
      />

      <Section title="Industry scenarios">
        <div className="card-grid three-col">
          <Card
            title="Banking Chatbots"
            description="Prevent assistants from drifting into unauthorized financial advice and policy exceptions."
          />
          <Card
            title="Enterprise Copilots"
            description="Validate boundaries for internal knowledge assistants handling sensitive workflows."
          />
          <Card
            title="Autonomous AI Agents"
            description="Stress-test role adherence for agents orchestrating tasks across tools and systems."
          />
        </div>
      </Section>

      <Section title="Team outcomes">
        <div className="card-grid two-col">
          <Card
            title="Product Teams"
            description="Ship faster with confidence by catching behavior regressions before production rollouts."
          />
          <Card
            title="Risk & Governance"
            description="Maintain audit-ready evidence for AI policy enforcement and escalation decisions."
          />
        </div>
      </Section>

      <Section title="Intent Layer examples" description="Use runtime controls to keep AI within policy boundaries.">
        <div className="card-grid three-col">
          <Card
            title="Prevent chatbot misuse"
            description="Block unrelated prompts and keep assistants focused on intended support tasks."
          />
          <Card
            title="Restrict AI agents"
            description="Allow only approved intent classes before forwarding actions to agent backends."
          />
          <Card
            title="Enforce enterprise policies"
            description="Apply intent-based controls for regulated workflows and governance requirements."
          />
        </div>
      </Section>
    </>
  );
}
