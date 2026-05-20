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

## Notes

- The current waitlist form stores the submitted email in `localStorage`.
- Firebase configuration files are included for deployment.
- The original README was the default Vite starter README and has been replaced with project-specific documentation.
