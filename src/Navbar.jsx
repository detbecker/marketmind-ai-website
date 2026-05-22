import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between bg-transparent" style={{ position: 'relative', zIndex: 50 }}>
      <Link to="/" className="logo-container">
        <img src="/MMAI-Dark.png" alt="MarketMind AI" className="logo-img" style={{ width: '64px', height: 'auto' }} />
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 no-underline">Home</Link>
        <Link to="/details" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 no-underline">Concept Details</Link>
        <Link to="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 no-underline">Contact</Link>
        <Link to="/blog" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 no-underline">Blog</Link>
        <Link to="/privacy" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 no-underline">Privacy Policy</Link>
      </div>

      <Link to="/" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 no-underline">
        Back to Homepage
      </Link>
    </nav>
  );
}
