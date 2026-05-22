/* Privacy Policy Component for marketmind-ai.com
  Entity: SSR Research and Development, Inc.
  Effective Date: May 22, 2026
*/

import React from 'react';
import Navbar from './Navbar';
import './Home.css'; // Ensure styling matches layout baseline

export default function PrivacyPolicy() {
  return (
    <div className="home-wrapper min-h-screen">
      <div className="bg-glow" style={{ top: '-10%', left: '-10%' }}></div>
      <Navbar />
      <div className="privacy-container max-w-4xl mx-auto px-6 py-12 text-gray-300 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="mb-4 text-sm text-gray-400">Last Updated: May 22, 2026</p>
        
        <p className="mb-6">
          MarketMind AI is an informational web infrastructure operated by <strong>SSR Research and Development, Inc.</strong> ("we," "us," or "our"). This policy outlines our protocols regarding the collection, transmission, and processing of telemetry, diagnostic events, and corporate inquiry data captured on <code>marketmind-ai.com</code>.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-white">1. Core Telemetry & Data Collection</h2>
        <p className="mb-4">
          As an informational destination preparing for our Fall 2026 production application release, this site captures clear baseline metrics to prevent unmonitored tracking degradation. We ingest:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Client-Side Telemetry:</strong> Anonymized site interaction logs processed via Google Tag Manager (GTM) container <code>GTM-KNSPHJXZ</code> and Google Analytics 4 (GA4) triggers.</li>
          <li><strong>Inquiry Records:</strong> Corporate communication details, including email coordinates and institutional parameters submitted directly via our <code>/contact</code> gateway.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-white">2. Data Layer Separation & Algorithmic Truth</h2>
        <p className="mb-4">
          This informational site is strictly decoupled from our upcoming analytical interface running at <code>marketmindai.ai</code>. No client-side cookies or event tracking configurations managed on this site hook into, interact with, or query core data engines, Fivetran ad platform tables, or Google Cloud BigQuery warehouses.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-white">3. Third-Party Edge Services</h2>
        <p className="mb-4">
          To maintain strict performance baselines and edge-security compliance, certain static resources are retrieved via Content Delivery Networks (CDNs), including Google Fonts. Support emails are routed to <code>inquiries@marketmind-ai.com</code> and managed securely by SSR Research and Development, Inc. operational layers.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-white">4. Regulatory Inquiries</h2>
        <p className="mb-4">
          For administrative updates, data rectifications, or institutional data layer inquiries, address formal correspondence to our corporate management layer at <strong>inquiries@marketmind-ai.com</strong>.
        </p>
      </div>
    </div>
  );
}
