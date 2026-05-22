// src/Home.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import './Home.css';
import Navbar from './Navbar';

// Import images
import heroDashboard from './assets/hero_dashboard.png';
import infographic2 from './assets/MMAI-Infographic-2.png';
import workflow1 from './assets/marketmind_workflow_1.jpg';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "MarketMind-AI  FinOps for Marketing";
  }, []);

  return (
    <div className="home-wrapper">
      {/* Background glow effects */}
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow" style={{ top: '40%', right: '-20%' }}></div>
      <div className="bg-glow" style={{ bottom: '-10%', left: '20%' }}></div>

      {/* Navigation */}
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="section hero-section container">
        <div className="hero-content">
          <motion.h1 
            className="h1"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Stop letting ad platforms <br className="hidden-mobile" />
            <span className="text-gradient-purple-blue">grade their own homework.</span>
          </motion.h1>
          
          <motion.h2 
            className="h2 text-xl mt-4 mb-2 text-gray-300"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Enterprise FinOps and Algorithmic Attribution
          </motion.h2>
          
          <motion.p 
            className="body-large"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Discover the <strong>Algorithmic Truth</strong> of your marketing portfolio. MarketMind AI maps the complete multi-touch customer journey, neutralizing platform bias to reveal the true incremental revenue of every dollar you spend.
          </motion.p>
          
          <motion.div 
            className="hero-cta"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <button className="btn btn-primary" onClick={() => navigate('/contact')}>
              Request Demo <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        <motion.div 
          className="hero-image-wrapper glass-panel"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img src={heroDashboard} alt="MarketMind AI Dashboard" className="hero-image" />
          <div className="floating-badge badge-1">
            <span className="badge-dot green"></span> True ROAS: +24%
          </div>
          <div className="floating-badge badge-2">
            <span className="badge-dot blue"></span> Bias Eliminated
          </div>
        </motion.div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="section problem-section">
        <div className="container">
          <div className="split-layout">
            <motion.div 
              className="split-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="h2 text-gradient">The Last-Click Illusion</h2>
              <p className="body-text">
                For decades, brands have burned millions based on a systemic lie: simplistic, last-click attribution.
              </p>
              <p className="body-text" style={{ marginTop: '1rem' }}>
                When Google, Meta, and TikTok all claim 100% credit for the same conversion, your budget is dictated by platform bias, not business reality.
              </p>
              <div className="callout glass-panel mt-2">
                <p><strong>It’s time to stop paying for Demand Interception and start investing in Demand Generation.</strong></p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/blog/marketing-forensic-engineering-capital-preservation" className="btn btn-secondary">
                  Read forensic engineering deep dive
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="split-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <img src={infographic2} alt="Multi-touch Attribution Infographic" className="rounded-image" />
            </motion.div>
          </div>
        </div>
      </section>


      {/* 4. THE OUTPUT SECTION */}
      <section className="section output-section">
        <div className="container">
          <div className="split-layout reverse">
            <motion.div 
              className="split-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="h2 text-gradient">A Fractional Chief Data Scientist in Your Boardroom.</h2>
              <p className="body-text mb-2">
                MarketMind AI doesn't just give you more charts. Our proprietary architecture spins up dedicated AI Specialists for every ad platform. They ingest your live BigQuery data, cross-reference the Algorithmic Truth, and pass their findings to an AI Orchestrator that writes boardroom-ready Executive Summaries.
              </p>
              
              <ul className="feature-list">
                <li>
                  <span className="feature-dot"></span>
                  <div>
                    <strong>Descriptive:</strong> <span className="text-muted">What actually happened across your portfolio.</span>
                  </div>
                </li>
                <li>
                  <span className="feature-dot"></span>
                  <div>
                    <strong>Predictive:</strong> <span className="text-muted">Where your ROAS is trending next quarter.</span>
                  </div>
                </li>
                <li>
                  <span className="feature-dot"></span>
                  <div>
                    <strong>Prescriptive:</strong> <span className="text-muted">Exactly where to shift your budget today to maximize returns.</span>
                  </div>
                </li>
              </ul>

              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/blog/fractional-chief-data-scientist" className="btn btn-secondary">
                  Read the full boardroom analysis
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="split-image"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src={workflow1} alt="MarketMind AI Workflow" className="rounded-image shadow-lg border-subtle" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA SECTION */}
      <section className="section cta-section container">
        <motion.div 
          className="cta-card glass-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="h2 text-gradient-purple-blue">Ready to find your Algorithmic Truth?</h2>
          <p className="body-large mb-3">
            Join the next generation of data-driven CMOs.
          </p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/contact')}>
            Book a Platform Tour <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer-content">
          <div className="logo-container">
            <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img small" />
          </div>
          <p className="footer-text">
            MarketMind AI is a product of <a href="https://ssr-research.ai" target="_blank" rel="noopener noreferrer">SSR Research and Development, Inc.</a>
          </p>
          <p className="copyright">&copy; {new Date().getFullYear()} MarketMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
