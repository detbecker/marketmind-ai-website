// src/ChatWidget.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatWidget.css';

// ─── Configuration ────────────────────────────────────────────────────────────
const NOTIFY_URL     = import.meta.env.VITE_NOTIFY_FUNCTION_URL || '';
const NOTIFY_TOKEN   = import.meta.env.VITE_NOTIFY_FUNCTION_TOKEN || '';
const CHAT_PROXY_URL = import.meta.env.VITE_CHAT_PROXY_URL || '';
const CHAT_PROXY_TOKEN = import.meta.env.VITE_CHAT_PROXY_TOKEN || '';

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
    const boundedMessages = Array.isArray(messages)
      ? messages.slice(-20).map((m) => ({
          role: m?.role === 'user' ? 'user' : 'assistant',
          text: typeof m?.text === 'string' ? m.text.slice(0, 2000) : '',
        }))
      : [];
    const headers = { 'Content-Type': 'application/json' };
    if (NOTIFY_TOKEN) {
      headers['x-chat-notify-token'] = NOTIFY_TOKEN;
    }

    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, sessionId, messages: boundedMessages }),
    });
  } catch (err) {
    console.error('[ChatWidget] Notification failed:', err);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatWidget({ initialEmail = '', initialOpen = false, bottomOffset = '1.75rem' }) {
  const [isOpen, setIsOpen]       = useState(initialOpen);
  const [messages, setMessages]   = useState([
    {
      role: 'assistant',
      text: "Hello. I'm the MarketMind AI Assistant. What brings you here today — attribution accuracy, budget reallocation, or something else?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [capturedEmail, setCapturedEmail] = useState(initialEmail || null);
  const [sessionId]   = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const [hasNotified, setHasNotified]     = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);

  const messagesEndRef   = useRef(null);
  const inputRef         = useRef(null);
  const historyRef       = useRef([]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  const addMessage = useCallback((role, text) => {
    setMessages(prev => [...prev, { role, text }]);
    if (role === 'assistant' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  }, [isOpen]);

  // ── Send message to Gemini ────────────────────────────────────────────────
  const sendToGemini = useCallback(async (userText) => {
    if (!CHAT_PROXY_URL) {
      addMessage('assistant', 'The AI engine is not configured. Please contact the site administrator.');
      return;
    }

    historyRef.current.push({ role: 'user', text: userText.slice(0, 2000) });

    setIsTyping(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (CHAT_PROXY_TOKEN) {
        headers['x-chat-proxy-token'] = CHAT_PROXY_TOKEN;
      }

      const response = await fetch(CHAT_PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: historyRef.current.slice(-30),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data?.reply?.trim()
        || "I didn't catch that. Could you rephrase?";

      historyRef.current.push({ role: 'assistant', text: replyText.slice(0, 2000) });
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
        return;
      }
    }

    await sendToGemini(text);

    if (capturedEmail && !hasNotified) {
      setHasNotified(true);
      await notifyLead({
        email: capturedEmail,
        sessionId,
        messages: [
          ...messages,
          { role: 'user', text },
        ],
      });
    }
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
    <div className="chat-widget-root" style={{ bottom: bottomOffset }} role="complementary" aria-label="MarketMind AI Chat Assistant">
      {/* ── Chat Panel ── */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`} aria-hidden={!isOpen}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar" aria-hidden="true">
              <img src="/favicon.png" alt="" />
            </div>
            <div>
              <div className="chat-header-title">MarketMind AI Assistant</div>
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
        onClick={toggleChat}
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
