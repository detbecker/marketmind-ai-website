import React from 'react';
import Navbar from './Navbar';
import './Home.css';

export default function Blog() {
  return (
    <div className="home-wrapper min-h-screen">
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <Navbar />
      <div className="container max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
        <h1 className="text-3xl font-bold text-white mb-4">
          MarketMind AI Engineering Chronicles — Launching Fall 2026
        </h1>
        <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
          We are currently preparing our deep dives into the algorithmic truth. Check back soon for authoritative insights into our enterprise attribution engine, Markov chain pathing, and Bayesian inference models.
        </p>
      </div>
    </div>
  );
}
