# GTM Tracking Validation

Use this checklist to verify the MarketMind AI Assistant funnel tracking after deployment.

## Events

- `marketmind_ai_assistant_button_click`: fires when the user clicks the MarketMind AI Assistant button.
- `marketmind_ai_assistant_email_submit`: fires when the user submits the corporate email form.

## Recommended GTM Setup

- Tag: `GA4 - Event - MarketMind Assistant Button Click`
	- Trigger: `CE - marketmind_ai_assistant_button_click`
	- Event name sent to GA4: `marketmind_ai_assistant_button_click`
- Tag: `GA4 - Event - MarketMind Assistant Email Submit`
	- Trigger: `CE - marketmind_ai_assistant_email_submit`
	- Event name sent to GA4: `marketmind_ai_assistant_email_submit`

Optional parameters you can pass through in each GA4 event tag:

- `component`: `chat_gateway`
- `action`: `open_email_gate` for the button click event
- `email_domain`: extracted domain for the email submit event

## Manual Checks

1. Open the site in an incognito browser session.
2. Confirm the email gate is hidden on page load.
3. Click the MarketMind AI Assistant button.
4. Verify the email form appears only after that click.
5. In Google Tag Manager Preview mode, confirm `marketmind_ai_assistant_button_click` fires on the button click.
6. Enter a valid corporate email and submit the form.
7. Confirm `marketmind_ai_assistant_email_submit` fires on submit and is separate from the open event.
8. Refresh and repeat to make sure the events fire consistently on a clean session.

## Expected Outcome

- The assistant open action and the email submit action are tracked as two distinct analytics events.
- The email gate remains user-triggered rather than static on initial page load.