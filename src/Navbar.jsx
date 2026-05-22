import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar container flex justify-between items-center py-4 flex-wrap gap-4">
      <Link to="/" className="logo-container">
        <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img" style={{ width: '64px', height: 'auto' }} />
      </Link>
      <div className="flex gap-6 items-center flex-wrap">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
        <Link to="/details" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Concept Details</Link>
        <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Contact</Link>
        <Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Blog</Link>
        <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="btn btn-secondary btn-sm flex items-center gap-2">
          Back to Homepage
        </Link>
      </div>
    </nav>
  );
}
