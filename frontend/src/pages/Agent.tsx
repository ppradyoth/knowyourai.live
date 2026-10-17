import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Markdown from "../components/Markdown";
import { getControls } from "../lib/content";

const installs = [
  { title: "Codex or a generic agent", command: "curl -fsSL https://knowyourai.live/agent/AGENTS.md -o AGENTS.md" },
  { title: "Claude Code skill", command: "mkdir -p .claude/skills/knowyourai-safe-ai\ncurl -fsSL https://knowyourai.live/agent/SKILL.md -o .claude/skills/knowyourai-safe-ai/SKILL.md" },
  { title: "Cursor rule", command: "mkdir -p .cursor/rules\ncurl -fsSL https://knowyourai.live/agent/knowyourai.mdc -o .cursor/rules/knowyourai.mdc" },
];

export default function Agent() {
  const controls = getControls().filter((control) => control.meta.review === "reviewed");
  return <section className="section gd-guide">
    <SEO title="AI safety rules for your coding agent" description="Download the reviewed guide rules as AGENTS.md, a Claude Code skill or a Cursor rule. Read each rule and its source control before installing." path="/agent" />
    <header className="section-header"><p className="eyebrow">The agent pack</p><h1>Give your coding agent the reviewed rules</h1><p>One rule per reviewed control, with a link to the code, check and limits in the guide.</p></header>
    {!controls.length && <p className="paragraph">No reviewed rules are available yet. Downloads contain a header only until owner review is complete.</p>}
    <p className="paragraph">Review the download and merge it with your existing instructions before replacing a file. These commands write the named files in your current project.</p>
    {installs.map((install) => <section key={install.title}><h2>{install.title}</h2><Markdown>{`\`\`\`bash\n${install.command}\n\`\`\``}</Markdown></section>)}
    <section><h2>Current rules</h2><p className="gd-guide-meta">{controls.length} reviewed controls</p>
      <ul className="list gd-agent-rules">{controls.map((control) => <li key={control.slug}>{control.meta.agent_rule} <Link to={`/guide/controls/${control.slug}`}>{control.meta.title}</Link></li>)}</ul>
    </section>
    <section><h2>Know the limit</h2><p>These are instructions to a model. A model can ignore them, so they do not replace the controls. Read the <Link to="/guide">guide</Link> and test the boundaries in your own code.</p></section>
  </section>;
}
