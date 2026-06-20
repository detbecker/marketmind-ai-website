# MarketMind AI Website

Marketing website for **MarketMind AI**, a product focused on helping teams understand the true performance of their marketing portfolio through multi-touch attribution, AI-assisted analysis, and budget optimization.

## Overview

This repository contains the frontend code for the MarketMind AI website. It presents the product story, core attribution concepts, and a pre-launch waitlist experience.

The site currently includes:

- A **coming soon / launch landing page** with a waitlist email form
- A **product details page** explaining the MarketMind AI concept
- Messaging around:
  - multi-touch attribution
  - Markov chain customer journey pathing
  - Bayesian inference
  - Google Query Volume (GQV) demand isolation
  - Google Meridian calibration
  - prescriptive marketing analytics

## Tech Stack

- **React 19**
- **Vite**
- **React Router**
- **Framer Motion** for animation
- **Lucide React** for icons
- **Firebase hosting configuration**
- **Tailwind CSS** and custom CSS styles

## Application Structure

- `/src/App.jsx` – application routing
- `/src/ComingSoon.jsx` – pre-launch landing page and waitlist form
- `/src/Home.jsx` – detailed marketing/product page
- `/src/assets` – website images and visual assets
- `/public` – static public assets

## Routes

- `/` – Coming soon / waitlist page
- `/details` – Product details page

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Chatbot Security Setup

The chatbot now uses a server-side proxy to call Gemini so browser clients do not need a direct AI key.

Frontend environment variables:

- VITE_CHAT_PROXY_URL: HTTPS URL of the deployed chatProxy function
- VITE_CHAT_PROXY_TOKEN: Optional shared secret header for chatProxy requests
- VITE_NOTIFY_FUNCTION_URL: HTTPS URL of the deployed chatNotify function
- VITE_NOTIFY_FUNCTION_TOKEN: Optional shared secret header for chatNotify requests

Backend Cloud Function environment variables:

- GEMINI_API_KEY: Server-side Gemini key used by chatProxy
- GEMINI_MODEL: Optional, defaults to gemini-2.5-flash
- CHAT_PROXY_TOKEN: Optional shared secret expected in x-chat-proxy-token
- CHAT_NOTIFY_TOKEN: Optional shared secret expected in x-chat-notify-token
- SENDGRID_API_KEY and SENDGRID_SENDER_EMAIL for lead notifications

## Security And Stress Test Commands

Security smoke test for webhook:

```bash
npm run security:test:notify -- --url https://your-cloud-function-url
```

Security smoke test for chat proxy:

```bash
npm run security:test:proxy -- --url https://your-chat-proxy-url
```

Stress test for webhook:

```bash
npm run stress:test:notify -- --url https://your-cloud-function-url --total 200 --concurrency 25
```

Stress test for chat proxy:

```bash
npm run stress:test:proxy -- --url https://your-chat-proxy-url --total 100 --concurrency 10
```

## Notes

- The current waitlist form stores the submitted email in localStorage.
- Firebase configuration files are included for deployment.
- The original README was the default Vite starter README and has been replaced with project-specific documentation.
