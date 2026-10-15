import { Link } from "react-router-dom";
import { caseStudies } from "../../data/research";

const targets: Record<string, string> = {
  "jack-and-jill": "Jack & Jill AI", "notion-ai": "Notion AI", "priceline-penny": "Priceline (Penny)",
  "brave-leo": "Brave Leo", "meta-ai-whatsapp": "Meta AI (WhatsApp)", "claude-code": "Anthropic Claude Code",
  "reddit-answers": "Reddit Answers", "harvey-labs": "Harvey Labs", "hackerone-hai": "HackerOne Hai",
};

export default function CaseExcerpt({ slug }: { slug: string }) {
  const item = caseStudies.find((item) => item.target === targets[slug]);
  if (!item) return null;
  const anchor = `case-${item.target.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return <aside className="card gd-case-excerpt" aria-label="Case evidence">
    <p className="eyebrow">{item.brand ?? item.target} · {item.severity}</p>
    <p><strong>{item.hook}</strong></p>
    <ol className="list">{item.chain?.slice(0, 3).map((step) => <li key={step}>{step.split(/(?<=[.!?])\s+(?=[A-Z])/)[0]}</li>)}</ol>
    <p className="gd-guide-meta">{item.status}</p>
    <Link to={`/case-studies#${anchor}`}>Read the full case</Link>
  </aside>;
}
