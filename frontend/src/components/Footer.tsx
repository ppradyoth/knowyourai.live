import { Link } from "react-router-dom";

const footerGroups = [
  {
    title: "For developers",
    links: [
      { to: "/tools", label: "Open-source tools" },
      { to: "/ctf", label: "AI Security CTF" },
      { to: "/product", label: "Platform" },
      { to: "/intentscan", label: "IntentScan" },
      { to: "/enforce", label: "IntentEnforce" },
      { to: "/docs", label: "Docs" },
      { to: "/architecture", label: "Architecture" },
    ],
  },
  {
    title: "For teams",
    links: [
      { to: "/services", label: "Assessments" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/use-cases", label: "Use Cases" },
      { to: "/request", label: "Request an assessment" },
    ],
  },
  {
    title: "Research",
    links: [
      { to: "/case-studies", label: "Case Studies" },
      { to: "/research", label: "Publications" },
      { to: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/security", label: "Security" },
      { to: "/ethics", label: "Ethics" },
      { to: "/terms", label: "Terms" },
      { to: "/privacy", label: "Privacy" },
      { to: "/cookies", label: "Cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="container footer-grid">
        {footerGroups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="footer-heading">{group.title}</h2>
            <ul className="footer-list">
              {group.links.map((link) => (
                <li key={link.to}>
                  {link.to === "/ctf" ? <a href="/ctf" className="footer-link">{link.label}</a> : <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="container footer-meta">
        <p>© {new Date().getFullYear()} KnowYourAI. Know what your AI does, live.</p>
      </div>
    </footer>
  );
}
