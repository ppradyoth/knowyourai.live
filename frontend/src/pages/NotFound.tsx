import { Link, useLocation } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <>
    <SEO title="Page not found" description="The page you requested does not exist or has moved. Return home to continue browsing KnowYourAI." path={pathname} noindex />
    <Section
      eyebrow="404"
      title="Page not found"
      description="The page you requested does not exist or has moved."
    >
      <Link to="/" className="button-primary">
        Return Home
      </Link>
    </Section>
    </>
  );
}
