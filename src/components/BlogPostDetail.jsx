import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import { blogPosts } from '../data/blogPosts';
import adServerParadoxGraphic from '../assets/ad-server-paradox.jpeg';
import mmaiInfographic2 from '../assets/multi-touch-attribution-infographic.png';
import marketmindWorkflow1 from '../assets/marketmind-workflow-data-processing.jpg';
import workflow2 from '../assets/marketmind-workflow-insights.png';
import decouplingInfographic from '../assets/ai-decoupling-architecture-diagram.png';
import './Blog.css';

const imageMap = {
  '/src/assets/ad-server-paradox.jpeg': adServerParadoxGraphic,
  '/src/assets/multi-touch-attribution-infographic.png': mmaiInfographic2,
  '/src/assets/marketmind-workflow-data-processing.jpg': marketmindWorkflow1,
  '/src/assets/marketmind-workflow-insights.png': workflow2,
  '/src/assets/ai-decoupling-architecture-diagram.png': decouplingInfographic,
};

export default function BlogPostDetail() {
  const { slug } = useParams();
  const post = blogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    return (
      <div className="home-wrapper blog-page-shell" style={{ minHeight: '100vh' }}>
        <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
        <Navbar />
        <main className="container blog-main" style={{ position: 'relative', zIndex: 10 }}>
          <section className="glass-panel">
            <h1 className="h2" style={{ marginBottom: '1rem' }}>Post Not Found</h1>
            <p className="body-text" style={{ marginBottom: '1rem' }}>
              The requested article could not be located.
            </p>
            <Link to="/blog" className="btn btn-secondary">Back to Blog</Link>
          </section>
        </main>
      </div>
    );
  }

  const postImage = imageMap[post.image] || post.image;

  return (
    <div className="home-wrapper blog-page-shell" style={{ minHeight: '100vh' }}>
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow" style={{ top: '45%', right: '-18%' }}></div>
      <Navbar />

      <main className="container blog-main" style={{ position: 'relative', zIndex: 10 }}>
        <article className="glass-panel" style={{ lineHeight: 1.8 }}>
          <header style={{ marginBottom: '1.5rem' }}>
            <p className="body-text" style={{ marginBottom: '0.5rem' }}>Published {post.date}</p>
            <h1 className="h2" style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.3rem)', marginBottom: '0.75rem' }}>
              {post.title}
            </h1>
            <p className="body-large" style={{ margin: 0, maxWidth: '100%', fontSize: '1.08rem' }}>
              {post.excerpt}
            </p>
          </header>

          <figure className="blog-post-image-shell">
            <img
              src={postImage}
              alt={post.imageAlt || "MarketMind AI visualization for marketing attribution analysis"}
              className="blog-post-image"
              width="1408"
              height="792"
              loading="eager"
            />
          </figure>

          {post.content.map((block, idx) => {
            if (block.type === 'heading') {
              return (
                <h2 key={`${block.type}-${idx}`} className="h3" style={{ marginTop: '1.75rem' }}>
                  {block.text}
                </h2>
              );
            }

            if (block.type === 'list') {
              return (
                <ul key={`${block.type}-${idx}`} className="body-text" style={{ paddingLeft: '1.2rem', display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {block.items.map((item, itemIdx) => (
                    <li key={`item-${itemIdx}`}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={`${block.type}-${idx}`} className="body-text" style={{ marginTop: idx === 0 ? 0 : '1rem' }}>
                {block.text}
              </p>
            );
          })}

          <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/details" className="btn btn-primary">
              Open Full Architecture Brief
            </Link>
            <Link to="/blog" className="btn btn-secondary">
              Back to Blog Index
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
