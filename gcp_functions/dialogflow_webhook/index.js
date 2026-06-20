/* global exports, process, require */
/**
 * chatNotify — MarketMind AI Chat Notification Cloud Function
 *
 * Receives JSON from the browser chat widget whenever a user provides
 * their email address. Stores the conversation in Firestore and sends
 * an email notification via SendGrid.
 *
 * Runtime: Node.js 20, Google Cloud Functions (2nd Gen)
 *
 * Required environment variables:
 *   SENDGRID_API_KEY       — SendGrid API key
 *   SENDGRID_SENDER_EMAIL  — Verified sender (default: no-reply@marketmind-ai.com)
 *
 * Firestore collection: chat_leads
 */

const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitMap = new Map();
const ALLOWED_ORIGINS = [
  'https://marketmind-ai.com',
  'https://marketmind-ai-497018.web.app',
  'https://marketmind-ai-497018.firebaseapp.com',
];
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

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-chat-notify-token, x-chat-proxy-token');
}

exports.chatNotify = async (req, res) => {
  setCorsHeaders(req, res);

  // Preflight
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

    // Optional shared-secret auth to protect against direct endpoint abuse.
    const expectedToken = process.env.CHAT_NOTIFY_TOKEN;
    if (expectedToken) {
      const providedToken = req.headers['x-chat-notify-token'];
      if (providedToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized request.' });
      }
    }

    const { email, sessionId, messages } = req.body || {};

    // Basic validation
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 320) {
      return res.status(400).json({ error: 'Invalid or missing email address.' });
    }

    const rawSessionId = typeof sessionId === 'string' ? sessionId : '';
    const normalizedSessionId = rawSessionId.replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 128);
    const safeSessionId = normalizedSessionId || `session-${Date.now()}`;
    const safeMessages = sanitizeMessages(messages);
    const timestamp = new Date();

    // 1. Store in Firestore
    await firestore.collection('chat_leads').doc(safeSessionId).set(
      {
        email:     email.trim().toLowerCase(),
        sessionId: safeSessionId,
        messages:  safeMessages,
        createdAt: timestamp,
        status:    'new',
        sourceIp:  clientIp,
      },
      { merge: true }
    );

    console.log(`[chatNotify] Stored lead: ${email} (session: ${safeSessionId})`);

    // 2. Send email notification via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Format message history for email body
        const transcriptHtml = safeMessages.length
          ? safeMessages
              .map(
                (m) =>
                  `<tr style="vertical-align:top;">
                    <td style="padding:6px 12px;font-weight:600;color:${m.role === 'user' ? '#1d4ed8' : '#374151'};white-space:nowrap;min-width:80px;">${m.role === 'user' ? 'Visitor' : 'Assistant'}</td>
                    <td style="padding:6px 12px;color:#374151;">${escapeHtml(m.text)}</td>
                  </tr>`
              )
              .join('')
          : '<tr><td colspan="2" style="color:#9ca3af;">No transcript available.</td></tr>';

        await sgMail.send({
          to:   'sbecker@ssr-research.ai',
          from:  process.env.SENDGRID_SENDER_EMAIL || 'no-reply@marketmind-ai.com',
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
      <p style="margin:0;font-size:12px;color:#9ca3af;">View full session in <a href="https://console.firebase.google.com/project/marketmind-ai-497018/firestore" style="color:#1d4ed8;">Firestore</a> → chat_leads → ${safeSessionId}</p>
    </div>
  </div>
</body>
</html>`,
        });

        console.log(`[chatNotify] Email sent to sbecker@ssr-research.ai`);
      } catch (emailErr) {
        console.error('[chatNotify] Email send failed:', emailErr.message);
        // Don't fail the whole request — lead is already saved in Firestore
      }
    } else {
      console.warn('[chatNotify] SENDGRID_API_KEY not set — skipping email notification.');
    }

    return res.status(200).json({ success: true, message: 'Lead recorded.' });

  } catch (err) {
    console.error('[chatNotify] Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.chatProxy = async (req, res) => {
  setCorsHeaders(req, res);

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
};
