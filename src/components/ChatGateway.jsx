import React, { useEffect, useMemo, useState } from 'react';

const DF_SCRIPT_ID = 'df-messenger-bootstrap';
const DF_SCRIPT_SRC = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';

const PROJECT_ID = import.meta.env.VITE_DF_PROJECT_ID || 'marketmind-ai-497018';
const AGENT_ID = import.meta.env.VITE_DF_AGENT_ID || 'REPLACE_WITH_AGENT_ID';
const LOCATION = import.meta.env.VITE_DF_LOCATION || 'global';
const LANGUAGE_CODE = import.meta.env.VITE_DF_LANGUAGE_CODE || 'en';

function loadDialogflowScript() {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(DF_SCRIPT_ID);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = DF_SCRIPT_ID;
    script.src = DF_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Dialogflow Messenger bootstrap script.'));
    document.body.appendChild(script);
  });
}

async function mockRecaptchaValidation() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
}

function isCorporateEmail(value) {
  if (!value) return false;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  const blockedDomains = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']);
  const domain = email.split('@')[1] || '';
  return !blockedDomains.has(domain);
}

export default function ChatGateway() {
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!isVerified) return;

    let cancelled = false;
    loadDialogflowScript().catch(() => {
      if (!cancelled) {
        setErrorText('Unable to initialize secure chat right now. Please refresh and try again.');
        setIsVerified(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isVerified]);

  const disabled = useMemo(() => isSubmitting || email.trim().length === 0, [isSubmitting, email]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorText('');

    if (!isCorporateEmail(email)) {
      setErrorText('Please enter a valid corporate email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validated = await mockRecaptchaValidation();
      if (!validated) {
        setErrorText('Validation failed. Please try again.');
        return;
      }

      setIsVerified(true);
    } catch {
      setErrorText('Validation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 1000,
        width: 'min(420px, calc(100vw - 24px))',
      }}
      aria-live="polite"
    >
      {!isVerified ? (
        <div
          style={{
            background: 'rgba(8, 8, 12, 0.94)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
            padding: '18px',
          }}
        >
          <p
            style={{
              color: 'var(--text-main)',
              fontSize: '0.98rem',
              lineHeight: 1.5,
              marginBottom: '12px',
            }}
          >
            Enter your corporate email to access the MarketMind AI Assistant.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-main)',
                border: '1px solid #1e1e24',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '12px',
                outline: 'none',
              }}
            />

            <button
              type="submit"
              disabled={disabled}
              style={{
                width: '100%',
                background: '#6b21a8',
                color: '#ffffff',
                border: '1px solid #7c3aed',
                borderRadius: '10px',
                padding: '11px 14px',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Validating...' : 'Start Session'}
            </button>
          </form>

          {errorText ? (
            <p
              style={{
                marginTop: '10px',
                color: '#fca5a5',
                fontSize: '0.9rem',
              }}
            >
              {errorText}
            </p>
          ) : null}
        </div>
      ) : (
        <df-messenger
          project-id={PROJECT_ID}
          agent-id={AGENT_ID}
          language-code={LANGUAGE_CODE}
          location={LOCATION}
          max-query-length="120"
        >
          <df-messenger-chat-bubble chat-title="MarketMind AI Assistant" />
        </df-messenger>
      )}
    </div>
  );
}
