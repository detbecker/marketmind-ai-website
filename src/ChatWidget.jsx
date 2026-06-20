// src/ChatWidget.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatWidget.css';

// ─── Configuration ────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-2.5-flash';
const NOTIFY_URL     = import.meta.env.VITE_NOTIFY_FUNCTION_URL || '';

const SYSTEM_INSTRUCTION = `You are the Lead Forensic Data Architect for MarketMind AI. You are interacting with Chief Marketing Officers, Chief Financial Officers, Venture Capitalists, and Enterprise Data Engineers on the public marketing site: https://marketmind-ai.com.

Your Tone:
- Highly professional, analytical, direct, and sophisticated.
- Do not use generic AI buzzwords like "supercharge," "revolutionize," or "unleash."
- Speak like a seasoned enterprise auditor or senior engineer. Be informative but casual.
- Keep responses concise (under 3 short paragraphs). Enterprise executives do not want to read walls of text.

Your Core Knowledge & Philosophy:
1. The Problem: Modern ad platforms (Google, Meta, etc.) suffer from the "Self-Attributed Network Paradox." They grade their own homework, claim 100% credit for multi-touch conversions, and inflate their performance metrics. This is not fraud—it's a structural measurement failure baked into the industry.
2. The Solution: MarketMind AI deploys a Decoupled Multi-Agent Architecture. Our system uses a Deterministic Data Layer to capture every real touchpoint from raw server logs, CRM data, and first-party behavioral signals—bypassing platform-reported data entirely. We then run a Bayesian Markov Chain path attribution model to assign true, probabilistic credit to each channel.
3. The Validation Layer: We calibrate our attribution output against Google's Meridian Marketing Mix Model (open-source). This creates a two-model validation system: if our Bayesian model and Meridian agree, we have high confidence in the result. If they diverge, we flag it for human review.
4. GQV Isolation: We isolate Google Query Volume trends to separate "demand interception" (capturing existing demand) from "demand creation" (incremental channel lift). This is critical for accurately measuring the true impact of brand spend.

Key Talking Points for Specific Audiences:
- For CMOs: "Your platform ROAS is a self-reported metric. We give you an independent, auditable number." Focus on the concept of "independent attribution" and "budget reallocation."
- For CFOs: "We quantify the financial risk of your current attribution model. Bad data leads to misallocated budgets, which directly impacts EBITDA." Use language of "financial risk," "audit trail," and "verifiable ROI."
- For VCs: "The marketing attribution market is a $5B+ problem with no credible enterprise solution. We are building the first deterministic, auditable attribution layer." Emphasize "TAM," "defensible data moat," and "proprietary methodology."
- For Data Engineers: "We ingest raw event streams, apply probabilistic graphical models, and output attribution weights in a queryable BigQuery layer. No black boxes." Focus on the technical architecture.

Product Features:
- Deterministic Data Layer: Raw log ingestion, identity resolution, touchpoint mapping.
- Decoupled Multi-Agent AI: Independent agents for data validation, path modeling, and anomaly detection.
- Bayesian Markov Chain Attribution: Probabilistic credit assignment across the full customer journey.
- Meridian MMM Calibration: Google's open-source Marketing Mix Model used as a validation layer.
- GQV Isolation Engine: Separates demand interception from incremental channel lift.
- Enterprise Audit Trail: Every attribution decision is logged, versioned, and auditable.

Important Business Context:
- MarketMind AI is launching in Fall 2026.
- It is a product of SSR Research and Development, Inc.
- The website is https://marketmind-ai.com.
- To request beta access or a demo, direct users to the contact page: https://marketmind-ai.com/contact.

Email Capture Protocol:
When a user expresses genuine interest (asking about pricing, beta access, demos, partnership, or wanting to learn more), proactively ask for their business email address. Say something like: "I'd be happy to have one of our engineers follow up with you directly. What's the best business email address to reach you?" Validate that it looks like a legitimate business email (not a generic personal address if possible). Once captured, confirm: "Got it. I've flagged your inquiry for our team."

What You Do NOT Do:
- Do not make up specific pricing figures.
- Do not promise specific timelines beyond "Fall 2026."
- Do not discuss competitors by name.
- Do not engage with off-topic questions. Politely redirect: "I'm focused specifically on marketing attribution and the MarketMind AI platform. How can I help you with that?"`;

// ─── Email validation ─────────────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ─── Extract email from text ──────────────────────────────────────────────────
function extractEmail(text) {
  const match = text.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
  return match ? match[0] : null;
}

// ─── Send notification to Cloud Function ────────────────────────────────────
async function notifyLead({ email, sessionId, messages }) {
  if (!NOTIFY_URL) return;
  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sessionId, messages }),
    });
  } catch (err) {
    console.error('[ChatWidget] Notification failed:', err);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([
    {
      role: 'assistant',
      text: "Hello. I'm the Lead Forensic Data Architect here at MarketMind AI. What brings you here today — attribution accuracy, budget reallocation, or something else?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [capturedEmail, setCapturedEmail] = useState(null);
  const [emailPending, setEmailPending]   = useState(false);
  const [sessionId]   = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const [hasNotified, setHasNotified]     = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);

  const messagesEndRef   = useRef(null);
  const inputRef         = useRef(null);
  const historyRef       = useRef([]); // Gemini multi-turn history

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnreadCount(0);
    }
  }, [isOpen]);

  const addMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, { role, text }]);
    if (role === 'assistant' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  }, [isOpen]);

  // ── Send message to Gemini ────────────────────────────────────────────────
  const sendToGemini = useCallback(async (userText) => {
    if (!GEMINI_API_KEY) {
      addMessage('assistant', 'The AI engine is not configured. Please contact the site administrator.');
      return;
    }

    // Push to Gemini history
    historyRef.current.push({ role: 'user', parts: [{ text: userText }] });

    setIsTyping(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: historyRef.current,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
        || "I didn't catch that. Could you rephrase?";

      historyRef.current.push({ role: 'model', parts: [{ text: replyText }] });
      addMessage('assistant', replyText);
    } catch (err) {
      console.error('[ChatWidget] Gemini error:', err);
      addMessage('assistant', 'I\'m experiencing a connectivity issue. Please try again in a moment, or reach out directly at hello@marketmind-ai.com.');
    } finally {
      setIsTyping(false);
    }
  }, [addMessage]);

  // ── Handle user submission ────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping) return;

    setInputValue('');
    addMessage('user', text);

    // Check for email in user message
    if (!capturedEmail) {
      const email = extractEmail(text);
      if (email && isValidEmail(email)) {
        setCapturedEmail(email);
        setEmailPending(true);
        // Let Gemini respond naturally, then fire notification
        await sendToGemini(text);
        if (!hasNotified) {
          setHasNotified(true);
          await notifyLead({
            email,
            sessionId,
            messages: [
              ...messages,
              { role: 'user', text },
            ],
          });
        }
        setEmailPending(false);
        return;
      }
    }

    await sendToGemini(text);
  }, [inputValue, isTyping, capturedEmail, hasNotified, messages, sessionId, sendToGemini, addMessage]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="chat-widget-root" role="complementary" aria-label="MarketMind AI Chat Assistant">
      {/* ── Chat Panel ── */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`} aria-hidden={!isOpen}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar" aria-hidden="true">
              <img src="/favicon.png" alt="" />
            </div>
            <div>
              <div className="chat-header-title">Forensic Data Architect</div>
              <div className="chat-header-status">
                <span className="chat-status-dot" aria-hidden="true"></span>
                MarketMind AI
              </div>
            </div>
          </div>
          <button
            className="chat-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-row chat-bubble-row--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chat-bubble-avatar" aria-hidden="true">
                  <img src="/favicon.png" alt="" />
                </div>
              )}
              <div className={`chat-bubble chat-bubble--${msg.role}`}>
                {msg.text.split('\n').map((line, li) => (
                  <React.Fragment key={li}>
                    {line}
                    {li < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-bubble-row chat-bubble-row--assistant" aria-label="Assistant is typing">
              <div className="chat-bubble-avatar" aria-hidden="true">
                <img src="/favicon.png" alt="" />
              </div>
              <div className="chat-bubble chat-bubble--assistant chat-typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-area" onSubmit={handleSubmit} aria-label="Send a message">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about attribution, ROAS, or beta access…"
            rows={1}
            aria-label="Message input"
            aria-multiline="true"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      {/* ── Floating Bubble Button ── */}
      <button
        className={`chat-fab ${isOpen ? 'chat-fab--open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="chat-fab-badge" aria-label={`${unreadCount} unread messages`}>
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
