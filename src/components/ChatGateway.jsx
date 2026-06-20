import React, { useEffect, useMemo, useState } from 'react';
import ChatWidget from '../ChatWidget';

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const VERIFY_GATEWAY_URL =
  import.meta.env.VITE_VERIFY_CHAT_GATEWAY_URL ||
  'https://us-central1-marketmind-ai-497018.cloudfunctions.net/verifyChatGateway';

function loadRecaptchaScript(siteKey) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(RECAPTCHA_SCRIPT_ID);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script.'));
    document.body.appendChild(script);
  });
}

async function executeRecaptcha(siteKey) {
  if (!window.grecaptcha || typeof window.grecaptcha.ready !== 'function') {
    throw new Error('reCAPTCHA is not available.');
  }

  await new Promise((resolve) => window.grecaptcha.ready(resolve));
  return window.grecaptcha.execute(siteKey, { action: 'submit_email' });
}

function isCorporateEmail(value) {
  if (!value) return false;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  const blockedDomains = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']);
  const domain = email.split('@')[1] || '';
  return !blockedDomains.has(domain);
}

export default function ChatGateway({ isCookieBannerVisible = false }) {
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      setErrorText('Secure verification is unavailable. Missing reCAPTCHA site key.');
      return;
    }

    loadRecaptchaScript(RECAPTCHA_SITE_KEY).catch(() => {
      setErrorText('Unable to initialize bot verification. Please disable content-blocking for Google reCAPTCHA or refresh and try again.');
    });
  }, []);

  const disabled = useMemo(() => isSubmitting || email.trim().length === 0, [isSubmitting, email]);
  const bottomOffset = isCookieBannerVisible ? '132px' : '24px';

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorText('');

    if (!isCorporateEmail(email)) {
      setErrorText('Unable to verify your session. If you use a blocker or hardened privacy mode, allow Google reCAPTCHA and try again. If you are unable to do that, please reach out to: inquiries@marketmind-ai.com.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!RECAPTCHA_SITE_KEY) {
        setErrorText('Secure verification is unavailable. Missing reCAPTCHA site key.');
        return;
      }

      const recaptchaToken = await executeRecaptcha(RECAPTCHA_SITE_KEY);
      const response = await fetch(VERIFY_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setErrorText('Verification failed. Please try again later.');
          return;
        }
        throw new Error(`Verification endpoint failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data?.verified !== true) {
        setErrorText('Verification failed. Please try again.');
        return;
      }

      setIsVerified(true);
    } catch {
      setErrorText('Unable to verify your session. If you use a blocker or hardened privacy mode, allow Google reCAPTCHA and try again. If you are unable to do that, please reach out to: inquiries@marketmind-ai.com.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: bottomOffset,
        zIndex: 1000,
        width: 'min(420px, calc(100vw - 24px))',
        transition: 'bottom 0.2s ease',
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
        <ChatWidget
          initialEmail={email.trim().toLowerCase()}
          initialOpen={true}
          bottomOffset={bottomOffset}
        />
      )}
    </div>
  );
}
