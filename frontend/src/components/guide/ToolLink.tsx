import { Link } from "react-router-dom";
import { toolStages } from "../../data/tools";

export default function ToolLink({ slug }: { slug: string }) {
  const tool = toolStages.flatMap((stage) => stage.tools).find((tool) => tool.slug === slug);
  if (!tool) return null;
  return <article className="card"><h3><Link to={`/tools#${tool.slug}`}>{tool.name}</Link></h3><p>{tool.pitch}</p></article>;
}
