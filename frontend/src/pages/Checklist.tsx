import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import CopyButton from "../components/CopyButton";
import { getBuilds, getControls, getStages, type Content } from "../lib/content";

const builds = getBuilds();
const stages = getStages();
const controls = getControls();
const storageKey = "knowyourai-checklist";

export function selectChecklist(items: Content<"controls">[], stageItems: Content<"stages">[], selectedBuilds: string[], selectedStage: string) {
  const order = new Map(stageItems.map((stage) => [stage.slug, stage.meta.order]));
  const maximum = order.get(selectedStage) ?? -1;
  return items.filter((item) => item.meta.review === "reviewed"
    && (order.get(item.meta.stage) ?? Infinity) <= maximum
    && item.meta.builds.some((build) => selectedBuilds.includes(build)))
    .sort((a, b) => order.get(a.meta.stage)! - order.get(b.meta.stage)!);
}

export function checklistMarkdown(items: Content<"controls">[], checked: ReadonlySet<string>) {
  return "# AI launch checklist\n\n" + items.map((item) =>
    `- [${checked.has(item.slug) ? "x" : " "}] ${item.meta.checklist} (https://knowyourai.live/guide/controls/${item.slug})`).join("\n") + "\n";
}

export default function Checklist() {
  const [selectedBuilds, setSelectedBuilds] = useState(builds.map((build) => build.slug));
  const [selectedStage, setSelectedStage] = useState("before-first-users");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved) {
        if (Array.isArray(saved.builds)) {
          const selected = saved.builds.filter((slug: unknown): slug is string => typeof slug === "string" && builds.some((build) => build.slug === slug));
          if (selected.length) setSelectedBuilds(selected);
        }
        if (stages.some((stage) => stage.slug === saved.stage)) setSelectedStage(saved.stage);
        if (Array.isArray(saved.checked)) setChecked(new Set(saved.checked.filter((slug: unknown): slug is string => typeof slug === "string" && controls.some((control) => control.slug === slug))));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ builds: selectedBuilds, stage: selectedStage, checked: [...checked] })); } catch {}
  }, [ready, selectedBuilds, selectedStage, checked]);

  const items = selectChecklist(controls, stages, selectedBuilds, selectedStage);
  const completed = items.filter((item) => checked.has(item.slug)).length;
  const toggleBuild = (slug: string) => setSelectedBuilds((previous) => previous.includes(slug)
    ? previous.length > 1 ? previous.filter((item) => item !== slug) : previous
    : [...previous, slug]);
  const toggleControl = (slug: string) => setChecked((previous) => {
    const next = new Set(previous);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    return next;
  });

  return <section className="section gd-guide gd-checklist">
    <SEO title="AI launch checklist" description="Choose what you are building and your launch stage. Track reviewed AI safety controls in your browser and copy a checklist for your README or PR." path="/checklist" />
    <header className="section-header"><p className="eyebrow">Free · No signup</p><h1>AI launch checklist</h1><p>Pick your build and stage. Your selections and progress stay in this browser.</p></header>
    <fieldset className="gd-checklist-picker"><legend>What are you building?</legend>
      <div className="gd-checklist-builds">{builds.map((build) => <label key={build.slug}><input type="checkbox" value={build.slug} checked={selectedBuilds.includes(build.slug)} onChange={() => toggleBuild(build.slug)} />{build.meta.title}</label>)}</div>
    </fieldset>
    <fieldset className="gd-checklist-picker"><legend>Stage</legend><div className="gd-checklist-stages">{stages.map((stage) => <button key={stage.slug} type="button" aria-label={stage.meta.title} aria-pressed={selectedStage === stage.slug} onClick={() => setSelectedStage(stage.slug)}>{stage.meta.title}<span>{stage.meta.time}</span></button>)}</div></fieldset>
    <div className="gd-checklist-copy"><p aria-live="polite">{completed} of {items.length} selected controls complete</p><CopyButton text={checklistMarkdown(items, checked)} label="Copy as markdown" disabled={!items.length} /></div>
    {!items.length && <p className="paragraph">No reviewed controls match this selection yet. Draft pages are available in the <Link to="/guide">guide</Link> while owner review is pending.</p>}
    {stages.map((stage) => {
      const group = items.filter((item) => item.meta.stage === stage.slug);
      return group.length > 0 && <section key={stage.slug}><h2>{stage.meta.title}</h2><ul className="gd-checklist-items">{group.map((item) => <li key={item.slug} className="card"><label><input type="checkbox" checked={checked.has(item.slug)} onChange={() => toggleControl(item.slug)} /><span>{item.meta.checklist}</span></label><p className="gd-guide-meta">{item.meta.time} · <Link to={`/guide/controls/${item.slug}`}>{item.meta.title}</Link></p></li>)}</ul></section>;
    })}
    <section><h2>Know the limit</h2><p>This list includes reviewed controls for your selection. Checking a box records your progress, not proof that a boundary works. Run each control's check against your own product.</p></section>
  </section>;
}
