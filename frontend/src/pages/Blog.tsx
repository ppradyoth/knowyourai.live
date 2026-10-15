import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";
import { getPosts } from "../lib/content";

function readingTime(text: string) {
  return `${Math.ceil(text.trim().split(/\s+/).length / 200)} min read`;
}

export default function Blog() {
  const posts = getPosts();

  return (
    <>
      <SEO
        title="Blog"
        description="Perspectives on AI security, prompt injection, agent hijacking, and how AI systems break in production."
        path="/blog"
      />
      <Section
        eyebrow="Blog"
        title="Thinking on AI safety and behavior"
        description="Perspectives on how AI systems break, drift, and how to keep them in bounds."
      />

      <section className="section">
        <div className="blog-list">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <Link to={`/blog/${post.slug}`} className="blog-card-link">
                <h2 className="blog-card-title">{post.meta.title}</h2>
              </Link>
              <p className="blog-card-meta">
                {post.meta.date} &bull; {readingTime(post.body)}
              </p>
              <p className="blog-card-excerpt">{post.meta.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="blog-read-more">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
