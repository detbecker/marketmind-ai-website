const { onRequest } = require('firebase-functions/v2/https');

const MIN_RECAPTCHA_SCORE = 0.5;
const ALLOWED_ORIGINS = [
  'https://marketmind-ai.com',
  'https://marketmind-ai-497018.web.app',
  'https://marketmind-ai-497018.firebaseapp.com',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

function isCorporateEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;

  const blockedDomains = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']);
  const domain = email.split('@')[1] || '';
  return !blockedDomains.has(domain);
}

function maskEmail(email) {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'invalid-email';
  const safeLocal = localPart.length <= 2
    ? `${localPart[0] || '*'}*`
    : `${localPart.slice(0, 2)}***`;
  return `${safeLocal}@${domain}`;
}

exports.verifyChatGateway = onRequest(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecret) {
    console.error('[verifyChatGateway] Missing RECAPTCHA_SECRET_KEY');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { email, recaptchaToken } = req.body || {};

    if (!isCorporateEmail(email)) {
      return res.status(400).json({ error: 'Invalid corporate email address' });
    }

    if (typeof recaptchaToken !== 'string' || recaptchaToken.trim().length === 0) {
      return res.status(400).json({ error: 'Missing reCAPTCHA token' });
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptchaToken,
      }),
    });

    if (!response.ok) {
      console.error('[verifyChatGateway] reCAPTCHA upstream error:', response.status);
      return res.status(502).json({ error: 'Verification provider unavailable' });
    }

    const result = await response.json();
    const score = Number(result?.score || 0);

    if (result?.success === true && score >= MIN_RECAPTCHA_SCORE) {
      // Replace with Firestore write if desired.
      console.log('[verifyChatGateway] verified gateway access:', {
        email: maskEmail(email.trim().toLowerCase()),
        score,
      });
      return res.status(200).json({ verified: true });
    }

    return res.status(403).json({
      error: 'Forbidden',
      verified: false,
      score,
    });
  } catch (error) {
    console.error('[verifyChatGateway] verification failure:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
