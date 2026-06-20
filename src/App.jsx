// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CookieConsent from "react-cookie-consent";
import ComingSoon from './ComingSoon';
import Home from './Home';
import Contact from './Contact';
import BlogIndex from './components/BlogIndex';
import BlogPostDetail from './components/BlogPostDetail';
import PrivacyPolicy from './Privacy';
import ChatGateway from './components/ChatGateway';
import './index.css';

function App() {
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(false);

  useEffect(() => {
    setIsCookieBannerVisible(!document.cookie.includes('CookieConsent='));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/details" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
      <CookieConsent
        location="bottom"
        buttonText="Accept All"
        declineButtonText="Decline Optional"
        enableDeclineButton={true}
        onAccept={() => setIsCookieBannerVisible(false)}
        onDecline={() => setIsCookieBannerVisible(false)}
        style={{
          background: 'rgba(8, 8, 12, 0.96)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #1e1e24',
          color: '#e5e7eb',
          zIndex: 999,
        }}
        buttonStyle={{
          background: '#6b21a8',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: '600',
          padding: '10px 20px',
        }}
        declineButtonStyle={{
          background: 'transparent',
          color: '#9ca3af',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '10px 20px',
        }}
      >
        MarketMind AI utilizes minimal, deterministic cookies to ensure platform security and analyze site traffic. We do not sell your data to ad networks.
      </CookieConsent>
      {/* Global zero-trust chat gateway — persists across all routes */}
      <ChatGateway isCookieBannerVisible={isCookieBannerVisible} />
    </BrowserRouter>
  );
}

export default App;
