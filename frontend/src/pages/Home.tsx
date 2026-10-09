import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { caseStudies, contributions, studies } from "../data/research";
import { toolStages, type Tool } from "../data/tools";

const anchorId = (target: string) => `case-${target.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
const allTools = toolStages.flatMap((stage) => stage.tools);
const demos = ["knowyourai", "agentscan", "jev-guard", "weighted-safety-refusal"]
  .map((slug) => allTools.find((tool) => tool.slug === slug))
  .filter((tool): tool is Tool => Boolean(tool?.command && tool.output));
const totalFindings = caseStudies.reduce((sum, c) => sum + c.findings, 0);
const mergedProjects = [...new Set(contributions.filter((c) => c.status === "merged").map((c) => c.project))];
const mergedCount = contributions.filter((c) => c.status === "merged").length;
const [featured, ...otherCases] = caseStudies;
const firstSentence = (text: string) => text.slice(0, text.indexOf(". ") + 1 || text.length);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.setAttribute("data-shown", "true"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-shown", "true");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

function HeroTerminal() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);
  const demo = demos[active];
  const command = demo.command!.split("\n").slice(-1)[0];
  const done = typed >= command.length;

  useEffect(() => {
    if (reducedMotion()) { setTyped(command.length); return; }
    setTyped(0);
    const start = performance.now();
    const timer = window.setInterval(() => {
      const next = Math.min(command.length, Math.floor((performance.now() - start) / 22));
      setTyped(next);
      if (next >= command.length) window.clearInterval(timer);
    }, 30);
    return () => window.clearInterval(timer);
  }, [command]);

  useEffect(() => {
    if (!done || paused || reducedMotion()) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % demos.length), 6500);
    return () => window.clearTimeout(timer);
  }, [done, paused, active]);

  return (
    <div className="hm-term" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="hm-term-bar">
        <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
        <div className="hm-term-tabs" role="tablist" aria-label="Tool demos">
          {demos.map((tool, i) => (
            <button key={tool.slug} type="button" role="tab" aria-selected={i === active} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>{tool.slug === "weighted-safety-refusal" ? "wsr" : tool.slug}</button>
          ))}
        </div>
      </div>
      <pre className="hm-term-body"><code>
        <span className="hm-term-prompt">$ </span>{command.slice(0, typed)}{!done && <span className="hm-term-cursor" aria-hidden="true" />}
        {done && <span className="hm-term-out" key={demo.slug}>{`\n\n${demo.output}`}</span>}
      </code></pre>
      <div className="hm-term-foot">
        <span>{demo.pitch}</span>
        <Link to={`/tools#${demo.slug}`}>See {demo.name} →</Link>
      </div>
    </div>
  );
}

export default function Home() {
  const ref = useReveal();
  return (
    <div ref={ref} className="hm">
      <SEO path="/" />

      <section className="hm-hero">
        <div className="hm-hero-copy">
          <p className="hm-free"><strong>Free</strong> Every tool, the platform and the research</p>
          <h1>Know your AI. <span>Live.</span></h1>
          <p className="hm-lede">
            Find out what model you are really running, what your agent does when hostile text reaches it, and what it
            is allowed to do in production. Everything here is free. The only thing we charge for is a red-team
            assessment, because that takes our time.
          </p>
          <div className="hm-cta">
            <Link to="/tools" className="button-primary">Start free</Link>
            <Link to="/request" className="button-secondary">Book a paid assessment</Link>
          </div>
          <ul className="hm-ticks">
            <li>Open-source tools, free</li>
            <li>Hosted platform, free on your own key</li>
            <li>No card, no trial, no paid tier</li>
          </ul>
        </div>
        <HeroTerminal />
      </section>

      <section className="hm-proof" data-reveal>
        <div>
          <p className="eyebrow">Published research on</p>
          <p className="hm-proof-names">{caseStudies.map((c) => c.brand ?? c.target).join("  ·  ")}</p>
        </div>
        <div>
          <p className="eyebrow">Fixes merged upstream in</p>
          <p className="hm-proof-names">{mergedProjects.join("  ·  ")}</p>
        </div>
      </section>

      <section className="hm-block">
        <header className="hm-head" data-reveal>
          <p className="eyebrow">Three questions</p>
          <h2>Every AI incident starts with something nobody checked.</h2>
          <p>Each tool answers one question, runs in a command or two, and says plainly where it stops.</p>
        </header>
        <div className="hm-bento">
          {toolStages.slice(0, 3).map((stage, i) => (
            <Link key={stage.id} to={`/tools#${stage.id}`} className="hm-bento-card" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <span className="hm-bento-num">0{i + 1}</span>
              <p className="eyebrow">{stage.title}</p>
              <h3>{stage.question}</h3>
              <div className="hm-chips">{stage.tools.map((tool) => <span key={tool.slug}>{tool.name}</span>)}</div>
              <span className="hm-more">See the tools →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="hm-block">
        <header className="hm-head" data-reveal>
          <p className="eyebrow">Two ways in</p>
          <h2>Run it yourself for free, or pay us to do it.</h2>
        </header>
        <div className="hm-paths">
          <div className="hm-path" data-reveal>
            <p className="eyebrow">For developers · Free</p>
            <h3>Test it yourself</h3>
            <p>Scanners and benchmarks for your terminal and CI, plus IntentScan and IntentEnforce hosted free on your own Claude or Gemini key.</p>
            <ol className="hm-steps">
              <li><span>1</span>Sign in with Google</li>
              <li><span>2</span>Add your Claude or Gemini API key, stored encrypted</li>
              <li><span>3</span>Point IntentScan at your endpoint</li>
            </ol>
            <div className="hm-cta">
              <Link to="/signup" className="button-primary">Start free</Link>
              <Link to="/tools" className="button-secondary">Browse the tools</Link>
            </div>
          </div>
          <div className="hm-path hm-path-ink" data-reveal style={{ transitionDelay: "70ms" }}>
            <p className="eyebrow">For teams · Paid</p>
            <h3>Have it tested</h3>
            <p>A hands-on adversarial assessment grounded in the research below, ending in a findings report your engineers can act on.</p>
            <ol className="hm-steps">
              <li><span>1</span>Scope: what your system does and what worries you</li>
              <li><span>2</span>Attack: injection, tool hijacking, exfiltration</li>
              <li><span>3</span>Report: severity, reproduction, remediation</li>
            </ol>
            <div className="hm-cta">
              <Link to="/request" className="button-primary">Request an assessment</Link>
              <Link to="/services" className="button-secondary">What's included</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hm-block">
        <header className="hm-head" data-reveal>
          <p className="eyebrow">The research</p>
          <h2>We found it in production first.</h2>
          <p>Independent testing of shipped AI products. Each case records what was observed, what was not established, and how the vendor responded.</p>
        </header>
        <div className="hm-cases">
          <Link to={`/case-studies#${anchorId(featured.target)}`} className="hm-case-main" data-reveal>
            <div className="hm-case-meta"><span className="hm-sev">{featured.severityDetail}</span><span>{featured.findings} reported findings</span><span>{featured.status}</span></div>
            <p className="hm-case-target">{featured.brand ?? featured.target}</p>
            <blockquote>{featured.hook}</blockquote>
            <ol>{featured.chain?.slice(0, 3).map((step) => <li key={step}>{firstSentence(step)}</li>)}</ol>
            <span className="hm-more">Read the full case →</span>
          </Link>
          <div className="hm-case-list">
            {otherCases.slice(0, 4).map((c, i) => (
              <Link key={c.target} to={`/case-studies#${anchorId(c.target)}`} className="hm-case" data-reveal style={{ transitionDelay: `${(i + 1) * 60}ms` }}>
                <div className="hm-case-meta"><span className="hm-sev">{c.severityDetail || c.severity}</span><span>{c.target}</span></div>
                <p>{c.hook}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="hm-stats" data-reveal>
          <div><strong>{caseStudies.length}</strong><span>Published case studies</span></div>
          <div><strong>{totalFindings}</strong><span>Original reported findings</span></div>
          <div><strong>{allTools.length}</strong><span>Free tools</span></div>
          <div><strong>{mergedCount}</strong><span>Merged upstream security PRs</span></div>
        </div>
        <Link to="/case-studies" className="hm-more hm-more-block" data-reveal>All {caseStudies.length + studies.length} cases and studies →</Link>
      </section>

      <section className="hm-final" data-reveal>
        <h2>Your AI is live.<br /><span>Do you know what it does?</span></h2>
        <div className="hm-cta">
          <Link to="/tools" className="button-primary">Run your first scan</Link>
          <Link to="/request" className="button-secondary">Have us test it</Link>
        </div>
      </section>
    </div>
  );
}
