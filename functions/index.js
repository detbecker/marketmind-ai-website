const { onRequest } = require('firebase-functions/v2/https');
const { Firestore } = require('@google-cloud/firestore');

const MIN_RECAPTCHA_SCORE = 0.5;
const ALLOWED_ORIGINS = [
  'https://marketmind-ai.com',
  'https://marketmind-ai-website.web.app',
  'https://marketmind-ai-website.firebaseapp.com',
];
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const firestore = new Firestore();
const rateLimitMap = new Map();

const SYSTEM_INSTRUCTION = `You are the Lead Forensic Data Architect for MarketMind AI. You are speaking with executives and enterprise technical buyers.

Style and constraints:
- Be concise and high-signal.
- Keep replies below 3 short paragraphs.
- Stay focused on attribution, auditability, and FinOps for marketing.
- Do not invent pricing.
- Do not promise launch timelines beyond Fall 2026.
- Do not mention competitors by name.

Core positioning:
- Platform-reported ROAS is self-attributed and often inflated.
- MarketMind AI provides an independent deterministic data layer and a Bayesian Markov attribution model.
- Results are calibrated against Meridian MMM for validation.
- The system isolates demand interception versus demand creation.

Call to action:
- If a user asks for demos, pricing discussions, beta, partnerships, or follow-up, ask for a business email and confirm the request has been flagged.
- For beta access, direct users to https://marketmind-ai.com/contact.`;

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

function setChatCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-chat-notify-token, x-chat-proxy-token');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const current = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - current.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  current.count += 1;
  rateLimitMap.set(ip, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .slice(0, MAX_MESSAGES)
    .map((msg) => {
      const role = msg?.role === 'user' ? 'user' : 'assistant';
      const text = typeof msg?.text === 'string' ? msg.text : '';
      return {
        role,
        text: text.slice(0, MAX_MESSAGE_LENGTH),
      };
    });
}

function sanitizeChatMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .slice(-30)
    .map((msg) => {
      const role = msg?.role === 'assistant' ? 'model' : 'user';
      const text = typeof msg?.text === 'string' ? msg.text : '';
      return {
        role,
        parts: [{ text: text.slice(0, 2000) }],
      };
    })
    .filter((msg) => msg.parts[0].text.length > 0);
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

exports.chatNotify = onRequest(async (req, res) => {
  setChatCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const expectedToken = process.env.CHAT_NOTIFY_TOKEN;
    if (expectedToken) {
      const providedToken = req.headers['x-chat-notify-token'];
      if (providedToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized request.' });
      }
    }

    const { email, sessionId, messages, sendEmail = true } = req.body || {};
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 320) {
      return res.status(400).json({ error: 'Invalid or missing email address.' });
    }

    const rawSessionId = typeof sessionId === 'string' ? sessionId : '';
    const normalizedSessionId = rawSessionId.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 128);
    const safeSessionId = normalizedSessionId || `session-${Date.now()}`;
    const safeMessages = sanitizeMessages(messages);
    const timestamp = new Date();

    await firestore.collection('chat_leads').doc(safeSessionId).set(
      {
        email: email.trim().toLowerCase(),
        sessionId: safeSessionId,
        messages: safeMessages,
        createdAt: timestamp,
        status: 'new',
        sourceIp: clientIp,
      },
      { merge: true }
    );

    if (sendEmail && process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const transcriptHtml = safeMessages.length
          ? safeMessages
              .map(
                (m) =>
                  `<tr style="vertical-align:top;">\n                    <td style="padding:6px 12px;font-weight:600;color:${m.role === 'user' ? '#1d4ed8' : '#374151'};white-space:nowrap;min-width:80px;">${m.role === 'user' ? 'Visitor' : 'Assistant'}</td>\n                    <td style="padding:6px 12px;color:#374151;">${escapeHtml(m.text)}</td>\n                  </tr>`
              )
              .join('')
          : '<tr><td colspan="2" style="color:#9ca3af;">No transcript available.</td></tr>';

        await sgMail.send({
          to: 'sbecker@ssr-research.ai',
          from: process.env.SENDGRID_SENDER_EMAIL || 'no-reply@marketmind-ai.com',
          subject: `🎯 MarketMind AI — New Chat Lead: ${email}`,
          html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:24px 28px;">
      <h1 style="color:#fff;margin:0;font-size:18px;font-weight:600;">New Chat Lead Captured</h1>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">MarketMind AI Website Chatbot</p>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">Email</td>
          <td style="padding:8px 0;font-weight:600;color:#111827;">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Session ID</td>
          <td style="padding:8px 0;font-family:monospace;font-size:12px;color:#374151;">${safeSessionId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Timestamp</td>
          <td style="padding:8px 0;color:#374151;">${timestamp.toISOString()}</td>
        </tr>
      </table>
      <h2 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:12px;border-top:1px solid #e5e7eb;padding-top:16px;">Chat Transcript</h2>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
        ${transcriptHtml}
      </table>
    </div>
    <div style="padding:16px 28px;background:#f3f4f6;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">View full session in <a href="https://console.firebase.google.com/project/marketmind-ai-website/firestore" style="color:#1d4ed8;">Firestore</a> → chat_leads → ${safeSessionId}</p>
    </div>
  </div>
</body>
</html>`,
        });
      } catch (emailErr) {
        console.error('[chatNotify] Email send failed:', emailErr.message);
      }
    } else if (sendEmail && !process.env.SENDGRID_API_KEY) {
      console.warn('[chatNotify] SENDGRID_API_KEY is not configured. Lead saved without email alert.');
    }

    return res.status(200).json({ success: true, message: 'Lead recorded.' });
  } catch (err) {
    console.error('[chatNotify] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

exports.chatProxy = onRequest(async (req, res) => {
  setChatCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(`proxy:${clientIp}`)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const expectedToken = process.env.CHAT_PROXY_TOKEN;
    if (expectedToken) {
      const providedToken = req.headers['x-chat-proxy-token'];
      if (providedToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized request.' });
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server AI key is not configured.' });
    }

    const { messages } = req.body || {};
    const safeMessages = sanitizeChatMessages(messages);
    if (!safeMessages.length) {
      return res.status(400).json({ error: 'Missing messages payload.' });
    }

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: safeMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[chatProxy] Gemini API error:', apiResponse.status, errorText);
      return res.status(502).json({ error: 'Upstream AI service error.' });
    }

    const data = await apiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI service.' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('[chatProxy] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
