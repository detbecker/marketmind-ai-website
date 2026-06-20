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

exports.chatNotify = async (req, res) => {
  // CORS — allow the production domain and the Firebase preview domain
  const allowedOrigins = [
    'https://marketmind-ai.com',
    'https://marketmind-ai-website.web.app',
    'https://marketmind-ai-website.firebaseapp.com',
  ];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, sessionId, messages } = req.body || {};

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Invalid or missing email address.' });
    }

    const safeSessionId = (sessionId || `session-${Date.now()}`).replace(/[^a-zA-Z0-9\-_]/g, '');
    const timestamp = new Date();

    // 1. Store in Firestore
    await firestore.collection('chat_leads').doc(safeSessionId).set(
      {
        email:     email.trim().toLowerCase(),
        sessionId: safeSessionId,
        messages:  Array.isArray(messages) ? messages : [],
        createdAt: timestamp,
        status:    'new',
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
        const transcriptHtml = Array.isArray(messages)
          ? messages
              .map(
                (m) =>
                  `<tr style="vertical-align:top;">
                    <td style="padding:6px 12px;font-weight:600;color:${m.role === 'user' ? '#1d4ed8' : '#374151'};white-space:nowrap;min-width:80px;">${m.role === 'user' ? 'Visitor' : 'Assistant'}</td>
                    <td style="padding:6px 12px;color:#374151;">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
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
      <p style="margin:0;font-size:12px;color:#9ca3af;">View full session in <a href="https://console.firebase.google.com/project/marketmind-ai-website/firestore" style="color:#1d4ed8;">Firestore</a> → chat_leads → ${safeSessionId}</p>
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
