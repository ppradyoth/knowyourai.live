import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header" aria-label="KnowYourAI header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            AI
          </span>
          <div>
            <p className="brand-kicker">KnowYourAI</p>
            <h1>Intent Check</h1>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
