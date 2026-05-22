// src/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { label: 'Home',     to: '/'        },
  { label: 'Concept',  to: '/details' },
  { label: 'Contact',  to: '/contact' },
  { label: 'Blog',     to: '/blog'    },
  { label: 'Privacy',  to: '/privacy' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="nav-inner">

        {/* Logo */}
        <Link to="/" className="nav-logo-link">
          <img
            src="/MMAI-Dark.png"
            alt="MarketMind AI"
            className="nav-logo-img"
            width="237"
            height="112"
          />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
        </button>

        {/* Pill navigation group */}
        <nav
          id="primary-navigation"
          className={`nav-links${menuOpen ? ' open' : ''}`}
          aria-label="Primary navigation"
        >
          {navItems.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${pathname === to ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Primary CTA */}
        <Link to="/contact" className="nav-cta">
          Request Demo
        </Link>

      </div>
    </header>
  );
}
