import { NavLink, Outlet } from "react-router-dom";

const primaryNav = [
  { to: "/", label: "Home" },
  { to: "/intent-check", label: "Intent Check Your API" },
  { to: "/features", label: "Features" },
  { to: "/docs", label: "Docs" },
  { to: "/pricing", label: "Pricing" },
];

const secondaryNav = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

export default function SiteLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-row">
          <NavLink to="/" className="brand-link">
            <span className="brand-mark" aria-hidden="true">
              AI
            </span>
            <span>KnowYourAI</span>
          </NavLink>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-links" aria-label="Secondary navigation">
          {secondaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "footer-link active" : "footer-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <p className="footer-note">© {new Date().getFullYear()} KnowYourAI. Boundary assurance for AI systems.</p>
      </footer>
    </div>
  );
}
