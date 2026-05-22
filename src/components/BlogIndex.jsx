import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { blogPosts } from '../data/blogPosts';
import './Blog.css';

export default function BlogIndex() {
  return (
    <div className="home-wrapper blog-page-shell" style={{ minHeight: '100vh' }}>
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow" style={{ top: '45%', right: '-18%' }}></div>
      <Navbar />

      <main className="container blog-main" style={{ position: 'relative', zIndex: 10 }}>
        <section style={{ marginBottom: '2rem' }}>
          <p className="text-gradient-purple-blue blog-kicker">MarketMind AI Journal</p>
          <h1 className="h2" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Insights for Enterprise Attribution Leadership
          </h1>
          <p className="body-text blog-intro">
            Browse strategic posts, forensic framework updates, and boardroom-ready guidance.
          </p>
        </section>

        <section className="glass-panel" aria-label="All blog articles">
          <h2 className="h3" style={{ marginBottom: '1rem' }}>All Articles</h2>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {blogPosts.map((post) => (
              <article key={post.slug} className="glass-card" style={{ padding: '1.25rem' }}>
                <p className="body-text" style={{ marginBottom: '0.25rem' }}>{post.date}</p>
                <h3 className="h3" style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{post.title}</h3>
                <p className="body-text" style={{ marginBottom: '0.9rem' }}>{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="btn btn-secondary">
                  Read Post
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
