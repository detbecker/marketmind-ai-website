// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComingSoon from './ComingSoon';
import Home from './Home';
import Contact from './Contact';
import BlogIndex from './components/BlogIndex';
import BlogPostDetail from './components/BlogPostDetail';
import PrivacyPolicy from './Privacy';
import ChatWidget from './ChatWidget';
import './index.css';

function App() {
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
      {/* Global chat widget — persists across all routes */}
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
