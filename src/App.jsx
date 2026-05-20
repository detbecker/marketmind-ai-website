// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ComingSoon from './ComingSoon';
import Home from './Home';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/details" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
