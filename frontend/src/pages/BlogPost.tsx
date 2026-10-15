import { Link, useParams } from "react-router-dom";
import Markdown from "../components/Markdown";
import SEO from "../components/SEO";
import { getPost } from "../lib/content";

function readingTime(text: string) {
  return `${Math.ceil(text.trim().split(/\s+/).length / 200)} min read`;
}

export default function BlogPost() {
  const { slug } = useParams();

  const post = getPost(slug);

  if (!post) {
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

  const { meta, body } = post;

  return (
    <section className="section">
      <SEO title={meta.title} description={`${meta.excerpt} Read the full article.`} path={`/blog/${slug}`} noindex={meta.review === "pending"} />
      <div className="blog-post-wrap">
        <Link to="/blog" className="blog-back-link">← Blog</Link>

        <header className="blog-post-header">
          <h1 className="blog-post-title">{meta.title}</h1>
          <p className="blog-card-meta">
            {meta.date && <span>{meta.date}</span>}
            {meta.author && <span> &bull; {meta.author}</span>}
            <span> &bull; {readingTime(body)}</span>
          </p>
          {meta.excerpt && <p className="blog-post-excerpt">{meta.excerpt}</p>}
        </header>

        <Markdown>{body}</Markdown>
      </div>
    </section>
  );
}
