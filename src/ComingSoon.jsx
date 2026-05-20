// src/ComingSoon.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, TrendingUp, Target, ArrowRight, Mail, Sparkles, CheckCircle } from 'lucide-react';
import './ComingSoon.css';

export default function ComingSoon() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsSubmitted(true);
    // Simulate API registration, e.g., storing in local storage or analytics
    localStorage.setItem('marketmind_waitlist_email', email);
  };

  return (
    <div className="coming-soon-wrapper">
      {/* Background glow effects */}
      <div className="bg-glow cs-glow-1"></div>
      <div className="bg-glow cs-glow-2"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="grid-overlay"></div>

      {/* Navigation */}
      <nav className="navbar container">
        <div className="logo-container">
          <div className="logo-icon">M</div>
          <span className="logo-text font-bold text-lg tracking-wider">MarketMind AI</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/details')}>
          Concept Details <ArrowRight size={14} />
        </button>
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



          {/* Waitlist Form */}
          <motion.div 
            className="form-container-cs mt-10 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit} 
                  className="waitlist-form glass-panel"
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <Mail className="input-icon text-gray-500" size={18} />
                    <input 
                      type="email" 
                      placeholder="Enter your work email..." 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="email-input"
                    />
                    <button type="submit" className="btn btn-primary submit-btn">
                      Join Waitlist <ArrowRight size={16} />
                    </button>
                  </div>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  className="success-card glass-panel text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <CheckCircle size={48} className="success-icon text-emerald-400 mx-auto" />
                  <h3 className="h3 mt-4 text-white">You're on the list!</h3>
                  <p className="body-text text-gray-400 mt-2">
                    Thank you for joining. We have registered <strong>{email}</strong> for priority early access. We will keep you updated.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
            <div className="logo-icon small">M</div>
            <span className="logo-text">MarketMind AI</span>
          </div>
          <p className="copyright text-gray-500 text-sm">&copy; {new Date().getFullYear()} MarketMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
