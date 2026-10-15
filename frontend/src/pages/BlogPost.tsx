import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import SEO from "../components/SEO";

const postFiles = import.meta.glob("../blog/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function extractMeta(markdown: string) {
  const match = markdown.match(/---([\s\S]*?)---/);
  if (!match) return {};
  const meta: Record<string, string> = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) meta[key.trim()] = rest.join(":").trim().replace(/"/g, "");
  });
  return meta;
}

function readingTime(text: string) {
  return `${Math.ceil(text.trim().split(/\s+/).length / 200)} min read`;
}

export default function BlogPost() {
  const { slug } = useParams();

  const postEntry = Object.entries(postFiles).find(([path]) =>
    path.includes(`${slug}.md`)
  );

  if (!postEntry) {
    return (
      <section className="section">
        <SEO title="Post not found" description="This blog post could not be found. Browse the KnowYourAI blog for other posts." path={`/blog/${slug}`} noindex />
        <p className="paragraph">Post not found.</p>
        <Link to="/blog" className="button-secondary" style={{ marginTop: "16px", display: "inline-flex" }}>
          ← Back to Blog
        </Link>
      </section>
    );
  }

  const raw = postEntry[1] as string;
  const meta = extractMeta(raw);
  const body = raw.replace(/---[\s\S]*?---/, "").trim();

  return (
    <section className="section">
      <SEO title={meta.title} description={meta.excerpt} path={`/blog/${slug}`} />
      <div className="blog-post-wrap">
        <Link to="/blog" className="blog-back-link">← Blog</Link>

        <header className="blog-post-header">
          <h1 className="blog-post-title">{meta.title}</h1>
          <p className="blog-card-meta">
            {meta.date && <span>{meta.date}</span>}
            {meta.author && <span> &bull; {meta.author}</span>}
            <span> &bull; {readingTime(raw)}</span>
          </p>
          {meta.excerpt && <p className="blog-post-excerpt">{meta.excerpt}</p>}
        </header>

        <div className="prose">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
