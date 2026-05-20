// src/ComingSoon.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network, TrendingUp, Target, ArrowRight, Mail, Sparkles } from 'lucide-react';
import './ComingSoon.css';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-wrapper">
      {/* Background glow effects */}
      <div className="bg-glow cs-glow-1"></div>
      <div className="bg-glow cs-glow-2"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="grid-overlay"></div>

      {/* Navigation */}
      <nav className="navbar container">
        <div className="logo-container" onClick={() => navigate('/')}>
          <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img" />
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={() => navigate('/contact')}>
            <Mail size={14} /> Contact Us
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/details')}>
            Concept Details <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container content-container">
        <div className="hero-section-cs text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="pill-badge"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span>Launching Fall 2026</span>
          </motion.div>

          <motion.h1 
            className="h1 font-extrabold tracking-tight mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Algorithmic Truth of <br />
            <span className="text-gradient-purple-blue">Marketing Attribution</span>
          </motion.h1>

          <motion.p 
            className="body-large mt-4 text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're building the future of multi-agent AI data analysis, Markov chain path mapping, and marketing budget calibration. Join the waitlist to secure early access.
          </motion.p>



          {/* Contact Redirect Button */}
          <motion.div 
            className="flex justify-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button 
              className="btn btn-primary btn-large flex items-center gap-3"
              onClick={() => navigate('/contact')}
            >
              Request Beta Access <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>

        {/* Feature Teasers */}
        <section className="features-teasers-section mt-16 pt-10 border-t border-gray-800">
          <h2 className="text-center text-sm font-semibold tracking-widest text-purple-400 uppercase">Core Architecture Concepts</h2>
          <div className="grid-3 mt-8">
            <div className="glass-card flex flex-col justify-between">
              <div>
                <div className="icon-wrapper">
                  <Network size={24} className="text-purple-400" />
                </div>
                <h3 className="h3 mt-4">Bayesian Pathing</h3>
                <p className="body-text text-sm">
                  Markov chain modeling mapping multi-touch journeys to reveal true incremental value of every dollar spent.
                </p>
              </div>
            </div>

            <div className="glass-card flex flex-col justify-between">
              <div>
                <div className="icon-wrapper">
                  <TrendingUp size={24} className="text-blue-400" />
                </div>
                <h3 className="h3 mt-4">GQV Isolation</h3>
                <p className="body-text text-sm">
                  Isolates search traffic trends to filter demand interception from incremental channel actions.
                </p>
              </div>
            </div>

            <div className="glass-card flex flex-col justify-between">
              <div>
                <div className="icon-wrapper">
                  <Target size={24} className="text-cyan-400" />
                </div>
                <h3 className="h3 mt-4">Google Meridian</h3>
                <p className="body-text text-sm">
                  Calibrated via Google's modern Meridian Marketing Mix Model to optimize portfolio budgets seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer container mt-20">
        <div className="footer-content border-t border-gray-800 pt-8 flex justify-between items-center flex-wrap gap-4">
          <div className="logo-container">
            <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img small" />
          </div>
          <p className="footer-text">
            MarketMind AI is a product of <a href="https://ssr-research.ai" target="_blank" rel="noopener noreferrer">SSR Research and Development, Inc.</a>
          </p>
          <p className="copyright text-gray-500 text-sm">&copy; {new Date().getFullYear()} MarketMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
