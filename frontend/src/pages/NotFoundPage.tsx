import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="panel prose">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <p>
        Return to the <Link to="/">KnowYourAI home page</Link>.
      </p>
    </section>
  );
}
