import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  heading?: "h1" | "h2";
}

export default function Section({ title, eyebrow, description, children, className = "", heading: Heading = "h1" }: SectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      {(eyebrow || description || title) && (
        <header className="section-header">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <Heading>{title}</Heading>}
          {description && <p className="section-description">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
