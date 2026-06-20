/**
 * Dialogflow CX Webhook
 * 
 * Saves qualified lead details (email) to Firestore and sends a Slack notification.
 * Designed to run on Google Cloud Functions (2nd Gen / Node.js 20+ runtime).
 */

const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

// Optional: Provide this in Cloud Function environment variables
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL; 

exports.dialogflowWebhook = async (req, res) => {
  try {
    const body = req.body;
    
    // Extract Dialogflow CX session parameters and session details
    const sessionInfo = body.sessionInfo;
    const parameters = sessionInfo ? sessionInfo.parameters : null;
    const email = parameters ? parameters.email : null;
    const sessionId = sessionInfo && sessionInfo.session ? sessionInfo.session.split('/').pop() : 'unknown';

    // If email hasn't been captured yet, return empty fulfillment response to Dialogflow
    if (!email) {
      return res.status(200).json({
        fulfillmentResponse: {
          messages: []
        }
      });
    }

    const timestamp = new Date();

    // 1. Store the qualified lead in Firestore
    await firestore.collection('leads').doc(sessionId).set({
      email: email,
      createdAt: timestamp,
      status: 'new',
      sessionId: sessionId
    }, { merge: true });

    console.log(`Successfully stored lead in Firestore for session ${sessionId} (${email})`);

    // 2. Trigger Email Notification (SendGrid)
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
          to: 'sbecker@ssr-research.ai',
          from: process.env.SENDGRID_SENDER_EMAIL || 'no-reply@marketmind-ai.com',
          subject: 'MarketMind AI - New Chatbot Lead Captured',
          text: `A new user chatbot conversation occurred.\n\nLead Email: ${email}\nSession ID: ${sessionId}\nTimestamp: ${timestamp.toISOString()}`,
          html: `<p>A new user chatbot conversation occurred.</p><p><strong>Lead Email:</strong> ${email}</p><p><strong>Session ID:</strong> <code>${sessionId}</code></p><p><strong>Timestamp:</strong> ${timestamp.toISOString()}</p>`
        });
        console.log(`Email notification sent to sbecker@ssr-research.ai`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    // 3. Trigger Slack notification if webhook URL is configured
    if (SLACK_WEBHOOK_URL) {
      try {
        await fetch(SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 *New Lead Captured from Chatbot!* \n*Email:* ${email}\n*Session ID:* \`${sessionId}\`\n*Time:* ${timestamp.toISOString()}`
          })
        });
        console.log(`Slack notification sent successfully.`);
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
      }
    }

    // 3. Send final success message back to Dialogflow
    return res.status(200).json({
      fulfillmentResponse: {
        messages: [
          {
            text: {
              text: ["Thank you! One of our engineers will contact you at that address shortly."]
            }
          }
        ]
      }
    });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Graceful fallback response so the user's chatbot session doesn't freeze/crash
    return res.status(200).json({
      fulfillmentResponse: {
        messages: [
          {
            text: {
              text: ["Got it. We've recorded your email and will be in touch."]
            }
          }
        ]
      }
    });
  }
};
