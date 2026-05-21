// src/Contact.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, FileText, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import './Home.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Contact() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "MarketMind-AI  FinOps for Marketing";
  }, []);

  return (
    <div className="home-wrapper">
      {/* Background glow effects */}
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow" style={{ top: '60%', right: '-20%' }}></div>

      {/* Navigation */}
      <nav className="navbar container">
        <div className="logo-container" onClick={() => navigate('/')}>
          <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img" />
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={() => navigate('/details')}>
            Concept Details
          </button>
          <button className="btn btn-secondary btn-sm flex items-center gap-2" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to Waitlist
          </button>
        </div>
      </nav>

      {/* Contact Hero */}
      <header className="hero section container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge">Connect Responsibly</span>
          <h1 className="h1 text-gradient-purple-blue mt-4">Contact Us</h1>
          <p className="hero-subtitle max-w-2xl mx-auto mt-6 text-gray-300">
            We'd love to hear about your goals and constraints. Let's design a path to value — responsibly.
          </p>
        </motion.div>
      </header>

      {/* Contact Cards Grid */}
      <main className="container pb-20">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Card 1: Reach Us */}
          <motion.div className="glass-panel p-8 flex flex-col justify-between" variants={fadeInUp}>
            <div>
              <div className="icon-wrapper mb-6" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', width: 'fit-content', padding: '1rem', borderRadius: '12px' }}>
                <Phone size={24} />
              </div>
              <h3 className="h3 text-white text-xl font-bold mb-4">Reach Us</h3>
              <p className="body-text text-gray-300 mb-6 leading-relaxed">
                Prefer a quick chat? Use the details below or send a message to start a conversation.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone size={16} className="text-purple-400" />
                  <a href="tel:4697512933" className="hover:text-white transition-colors">469-751-2933</a>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={16} className="text-purple-400" />
                  <a href="mailto:inquiries@marketmind-ai.com" className="hover:text-white transition-colors">inquiries@marketmind-ai.com</a>
                </div>
              </div>
            </div>
            
            <a href="mailto:inquiries@marketmind-ai.com?subject=MarketMind%20AI%20Inquiry" className="btn btn-primary btn-sm w-full text-center flex items-center justify-center gap-2">
              <Mail size={14} /> Email Us
            </a>
          </motion.div>

          {/* Card 2: Looking for a Proposal? */}
          <motion.div className="glass-panel p-8 flex flex-col justify-between" variants={fadeInUp}>
            <div>
              <div className="icon-wrapper mb-6" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', width: 'fit-content', padding: '1rem', borderRadius: '12px' }}>
                <FileText size={24} />
              </div>
              <h3 className="h3 text-white text-xl font-bold mb-4">Looking for a Proposal?</h3>
              <p className="body-text text-gray-300 mb-6 leading-relaxed">
                Share your timeline, budget range, and most important success criteria. We'll follow up with a structured approach and next steps.
              </p>
            </div>
            
            <button className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2" onClick={() => navigate('/details')}>
              See Services <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Card 3: MarketMind AI Access */}
          <motion.div className="glass-panel p-8 flex flex-col justify-between" variants={fadeInUp}>
            <div>
              <div className="icon-wrapper mb-6" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', width: 'fit-content', padding: '1rem', borderRadius: '12px' }}>
                <ShieldAlert size={24} />
              </div>
              <h3 className="h3 text-white text-xl font-bold mb-4">Beta Early Access</h3>
              <p className="body-text text-gray-300 mb-6 leading-relaxed">
                Request early access to our flagship Agentic FinOps platform, or inquire about an Enterprise AI Readiness Audit.
              </p>
            </div>
            
            <button className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2" onClick={() => navigate('/')}>
              Join the Beta Waitlist <ArrowRight size={14} />
            </button>
          </motion.div>
        </motion.div>

        {/* Corporate Info Footer Bar */}
        <motion.div 
          className="glass-panel mt-16 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-white font-semibold text-lg mb-2">SSR Research and Development, Inc.</h4>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            An applied AI engineering lab. We build proprietary, ethical AI architectures and FinOps models that scale securely on Google Cloud.
          </p>
          <p className="text-purple-400 text-xs font-semibold mt-4 tracking-wider uppercase">
            Moving Enterprise AI from Research to Production.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer-content">
          <div className="logo-container" onClick={() => navigate('/')}>
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
