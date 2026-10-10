import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NavGroup = { label: string; to: string; children: { to: string; label: string; hint: string }[] };

const groups: NavGroup[] = [
  { label: "For developers", to: "/tools", children: [
    { to: "/tools", label: "Tools", hint: "Open-source scanners, benchmarks and labs" },
    { to: "/intentscan", label: "IntentScan", hint: "Probe a live endpoint for violations" },
    { to: "/enforce", label: "IntentEnforce", hint: "Intent policy in front of your model" },
    { to: "/docs", label: "API docs", hint: "Connect your endpoint" },
  ]},
  { label: "For teams", to: "/services", children: [
    { to: "/services", label: "Assessments", hint: "Hands-on adversarial testing" },
    { to: "/how-it-works", label: "How it works", hint: "From scope to findings report" },
    { to: "/request", label: "Request an assessment", hint: "Tell us about your system" },
  ]},
  { label: "Research", to: "/case-studies", children: [
    { to: "/case-studies", label: "Case studies", hint: "Findings in production AI systems" },
    { to: "/research", label: "Publications & open source", hint: "Papers and upstream fixes" },
    { to: "/blog", label: "Blog", hint: "Notes on AI security" },
  ]},
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === "light" ? "light" : "dark");

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  };
  const groupActive = (group: NavGroup) => group.children.some((child) => pathname === child.to || pathname.startsWith(`${child.to}/`));

  return (
    <header className="kn-header" data-solid={scrolled || open}>
      <div className="kn-spotlight" aria-hidden="true" />
      <div className="kn-progress" aria-hidden="true" />
      <div className="kn-nav">
        <Link to="/" className="kn-brand" aria-label="KnowYourAI home">
          <span className="kn-wordmark">knowyour<span>ai</span></span>
          <span className="kn-live">live</span>
        </Link>

        <nav className="kn-links" aria-label="Primary">
          {groups.map((group) => (
            <div key={group.label} className="kn-item">
              <Link to={group.to} className={`kn-link${groupActive(group) ? " active" : ""}`} aria-haspopup="true">
                {group.label} <span className="kn-caret" aria-hidden="true">▾</span>
              </Link>
              <div className="kn-menu">
                {group.children.map((child) => (
                  <Link key={child.to} to={child.to}>{child.label}<span>{child.hint}</span></Link>
                ))}
              </div>
            </div>
          ))}
          <a href="/ctf" className="kn-link">CTF</a>
          <NavLink to="/pricing" className={({ isActive }) => `kn-link${isActive ? " active" : ""}`}>Pricing</NavLink>
        </nav>

        <div className="kn-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            )}
          </button>
          {!loading && !user && <Link to="/login" className="kn-link">Log in</Link>}
          {!loading && (user
            ? <Link to="/dashboard" className="kn-cta">Dashboard</Link>
            : <Link to="/signup" className="kn-cta">Start free</Link>)}
          <button type="button" className="kn-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="kn-mobile" onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </div>

      <div id="kn-mobile" className="kn-mobile" data-open={open}>
        {groups.map((group) => (
          <div key={group.label}>
            <p className="kn-mobile-group">{group.label}</p>
            {group.children.map((child) => <Link key={child.to} to={child.to}>{child.label}<span aria-hidden="true">→</span></Link>)}
          </div>
        ))}
        <a href="/ctf">CTF<span aria-hidden="true">→</span></a>
        <p className="kn-mobile-group">Account</p>
        <Link to="/pricing">Pricing<span aria-hidden="true">→</span></Link>
        {user
          ? <Link to="/dashboard">Dashboard<span aria-hidden="true">→</span></Link>
          : <><Link to="/login">Log in<span aria-hidden="true">→</span></Link><Link to="/signup">Start free<span aria-hidden="true">→</span></Link></>}
      </div>
    </header>
  );
}
