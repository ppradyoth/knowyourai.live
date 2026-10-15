import { Link } from "react-router-dom";
import { getControls } from "../../lib/content";

export default function GuideNav({ stage, current }: { stage: string; current: string }) {
  return <nav className="gd-guide-nav" aria-label="Controls in this stage">
    <p className="eyebrow">In this stage</p>
    <ol>{getControls().filter((control) => control.meta.stage === stage).map((control) => <li key={control.slug}>
      <Link to={`/guide/controls/${control.slug}`} aria-current={control.slug === current ? "page" : undefined}>{control.meta.title}</Link>
    </li>)}</ol>
  </nav>;
}
