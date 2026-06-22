# Changelog

All notable changes to the **MarketMind AI Website** project will be documented in this file.

## [1.5.8] - 2026-06-22

### Fixed
- **Chat Lead Persistence Outage**: Restored `chatNotify` Firestore write access by correcting Cloud Functions runtime service-account IAM permissions in `marketmind-ai-website`.
- **Transcript Incompleteness**: Updated chat capture flow so `chat_leads` is refreshed on each turn after email capture, instead of recording only the first notification event.
- **Email Alert Behavior Control**: Added `sendEmail` request flag handling in `chatNotify` so transcript updates can continue without re-sending alert emails on every turn.

### Operational
- **Production Validation**: Verified successful `chatNotify` writes (HTTP 200 + Firestore document persistence) and confirmed multi-turn transcript updates in live environment.

## [1.5.7] - 2026-06-22

### Fixed
- **Chat Gateway Verification Failure (Production)**: Updated Hosting `Content-Security-Policy` `connect-src` to allow `https://*.a.run.app`, which is required for browser calls to the deployed 2nd-gen Cloud Run function endpoints (`verifychatgateway`, `chatnotify`, `chatproxy`).
- **Legacy Endpoint Allowlist Cleanup**: Removed stale old-project Cloud Functions allowlist entries from CSP after consolidating runtime traffic onto `marketmind-ai-website`.

### Deployment
- **Live Rollout Validation**: Redeployed Hosting and confirmed production response path health (`marketmind-ai.com` HTTP 200 and function preflight `OPTIONS` HTTP 204 for all three chat endpoints).

## [1.5.6] - 2026-06-22

### Fixed
- **CSP: GTM Preview Badge & Icons**: Added `https://www.googletagmanager.com` and `https://googletagmanager.com` to `style-src` (for the GTM debug `badge.css`) and `https://fonts.gstatic.com` to `img-src` (for Material Icons) so the GTM Tag Assistant Preview connection stops reporting "Not Connected".

## [1.5.5] - 2026-06-22

### Fixed
- **CSP: Google Analytics Apex Domain**: Added `https://analytics.google.com` to `connect-src` alongside `https://*.analytics.google.com` to resolve blocked GA requests hitting the apex host.
- **CSP: Connect Source Alignment**: Updated `connect-src` host ordering and function endpoints to match production tracking requirements across both Firebase Hosting projects.

## [1.5.4] - 2026-06-22

### Fixed
- **CSP: GTM Preview / Tag Assistant**: Expanded `script-src`, `style-src`, `img-src`, and `connect-src` directives to permit `googletagmanager.com`, `tagmanager.google.com`, `ssl.gstatic.com`, `*.google-analytics.com`, `*.analytics.google.com`, and `*.googletagmanager.com` so the GTM Preview / Tag Assistant connection no longer reports "Not Connected".
- **CSP: Google Ads / DoubleClick**: Added `https://*.doubleclick.net` and `https://*.googleadservices.com` to `connect-src` to unblock the Google Ads marketing ping to `ad.doubleclick.net/ccm/s/collect`.

## [1.5.3] - 2026-06-22

### Added
- **Split Assistant Funnel Tracking**: Moved the MarketMind AI Assistant email gate behind a dedicated assistant-button click so GTM can track the open action separately from email submission.

### Changed
- **Assistant Access Flow**: Replaced the always-visible corporate email prompt with a click-to-open popover that appears only after the assistant button is pressed.
- **Custom Event Separation**: Added distinct browser events for assistant launch and email submit so analytics can measure both steps independently.

## [1.5.2] - 2026-06-20

### Added
- **Zero-Trust Chat Gateway**: Added a pre-chat verification flow that gates chatbot access behind corporate-email entry and reCAPTCHA v3 verification.
- **Firebase Function Runtime**: Added a dedicated Firebase Functions codebase (`functions/`) with Node.js 22 configuration and a production `verifyChatGateway` endpoint.

### Changed
- **Dual Hosting Target Mapping**: Updated Firebase target configuration so the same deployment target can publish to both hosting sites (`marketmind-ai-497018` and `marketmind-ai-website`) as needed during migration.
- **Gateway Error Messaging**: Updated chatbot verification failures to instruct users to allow Google reCAPTCHA in hardened privacy modes and contact `inquiries@marketmind-ai.com` if needed.

### Fixed
- **Cookie Banner Overlap**: Adjusted chatbot vertical offset while the cookie consent bar is visible so consent controls remain accessible.
- **reCAPTCHA CSP Policy**: Expanded Hosting CSP directives to permit required Google reCAPTCHA script, frame, image, and connection origins.
- **Chat UX Regression**: Restored handoff to the branded custom `ChatWidget` after successful gateway verification (replacing unintended stock Dialogflow UI fallback).

## [1.5.1] - 2026-06-20

### Fixed
- **Gemini Model Update**: Upgraded the chatbot model from the deprecated `gemini-2.0-flash` to `gemini-2.5-flash` to restore live chatbot responses.

## [1.5.0] - 2026-06-20

### Added
- **Custom Gemini AI Chat Widget**: Replaced non-functional Dialogflow CX placeholder with a fully working, custom-built React chat widget powered by the Gemini 2.0 Flash API.
  - Dark blue glassmorphism design matching site theme (`#1e40af` accent, `rgba(6,10,22,0.92)` panel background)
  - Smooth open/close animation, typing indicator with bouncing dots, unread message badge on FAB
  - Full multi-turn conversation history passed to Gemini on each request
  - System prompt implements "Lead Forensic Data Architect" persona with MarketMind AI product knowledge
  - Email capture: automatically detects email addresses in conversation, validates format, fires Cloud Function notification
  - Fully accessible: `aria-label`, `role="log"`, `aria-live="polite"`, keyboard navigation, focus management
  - Mobile-responsive: panel collapses to near-full-width on screens ≤480px
- **`chatNotify` Cloud Function (v2.0)**: Rewrote `gcp_functions/dialogflow_webhook/index.js` as a generic JSON webhook
  - Accepts `{ email, sessionId, messages }` from browser chat widget
  - Stores complete conversation transcript to Firestore `chat_leads` collection
  - Sends richly formatted HTML email notification to `sbecker@ssr-research.ai` via SendGrid
  - CORS headers for `marketmind-ai.com`, Firebase preview domains, and `localhost`
- **Restricted Gemini API Key**: Created browser-restricted API key (`ssr-research-dev` project, key ID `978e1fd7`)
  - Locked to `generativelanguage.googleapis.com` only
  - Browser referrer restriction: `marketmind-ai.com`, `marketmind-ai-website.web.app`, `localhost`

### Changed
- **`index.html`**: Removed broken Dialogflow `<df-messenger>` widget and `bootstrap.js` script tag
- **`src/App.jsx`**: Added global `<ChatWidget />` import rendered outside `<Routes>` so it persists on all pages
- **`firebase.json` CSP**: Added `https://generativelanguage.googleapis.com` to `connect-src` directive
- **`src/index.css`**: Removed dead `df-messenger` CSS custom property overrides

### Removed
- Dialogflow CX `df-messenger` widget and its associated `bootstrap.js` CDN script (was non-functional — no agent ID configured)

## [1.4.0] - 2026-06-20

### Added
- feat: integrate GCP Agent Studio conversational bot and apply dark theme shadow-DOM CSS overrides.

## [1.3.9] - 2026-06-15

### Changed
- **Image SEO Optimization - Comprehensive Refactor**: Implemented complete image asset optimization across the entire site to improve search engine discoverability and user accessibility.
  - **File Naming Convention**: Renamed all image files to SEO-friendly kebab-case naming conventions with descriptive keywords:
    - `MMAI-Infographic-2.png` → `multi-touch-attribution-infographic.png`
    - `hero_dashboard.png` → `marketmind-ai-dashboard.png`
    - `marketmind_workflow_1.jpg` → `marketmind-workflow-data-processing.jpg`
    - `marketmind_workflow_2.png` → `marketmind-workflow-insights.png`
    - `mmai_infographic_decoupling.png` → `ai-decoupling-architecture-diagram.png`
    - `MMAI-Dark.png` → `marketmind-ai-logo-dark.png`

### Added
- **Enhanced Alt Text**: Implemented context-specific, descriptive alt text across all images:
  - Dashboard: "MarketMind AI Dashboard showing real-time marketing analytics and ROAS metrics"
  - Attribution infographic: "Multi-touch attribution infographic showing last-click illusion vs algorithmic truth"
  - Workflow diagrams: "MarketMind AI workflow showing data processing pipeline for Bayesian path attribution"
  - Added dynamic `imageAlt` field to blog post data structure for flexible alt text rendering per blog post

- **JSON-LD Schema Markup**: Added comprehensive schema.org ImageObject markup in `index.html` for six key images to enable rich snippets in Google Images and improve image discoverability:
  - MarketMind AI Dashboard
  - Multi-touch Attribution Infographic
  - MarketMind AI Workflow (data processing)
  - AI Decoupling Architecture Diagram
  - Ad Server Paradox Analysis
  - MarketMind AI Logo

### Removed
- **Asset Cleanup**: Removed unused and duplicate assets:
  - Deleted entire `/images/` directory (contained stale duplicates and old versions)
  - Removed unused `hero.png` from `/src/assets/`
  - Removed framework scaffolding files (`react.svg`, `vite.svg`)

### Technical
- **Code Reference Updates**: Updated all image references across 5 React components:
  - `src/Home.jsx`: 4 image imports + logo reference
  - `src/Navbar.jsx`: Logo reference with improved alt text
  - `src/ComingSoon.jsx`: Logo reference
  - `src/Contact.jsx`: Logo reference
  - `src/components/BlogPostDetail.jsx`: 5 image imports + dynamic imageMap + `postImage.imageAlt` rendering

- **Data Layer Enhancements**: Updated blog post data structures:
  - `src/data/blogPosts.js`: Added `imageAlt` fields to 2 blog posts with new image paths
  - `src/data/adServerParadoxArticle.js`: Added `imageAlt` field and updated image path

### SEO Impact
- Improved image discoverability in Google Images through keyword-rich filenames and schema markup
- Enhanced accessibility compliance with descriptive alt text for all images
- Reduced SEO penalties from uppercase and underscore-separated filenames
- Increased semantic clarity for search engine crawlers regarding image content and purpose

## [1.3.8] - 2026-05-25

### Added
- **Automated Sitemap Generation**: Added a build-linked sitemap generator that compiles the static routes and data-driven blog post URLs into `public/sitemap.xml` before each production build.

### Changed
- **Search Console Sitemap Remediation**: Published a valid XML sitemap to Firebase Hosting so `https://marketmind-ai.com/sitemap.xml` is served as XML instead of the SPA HTML shell.

## [1.3.7] - 2026-05-22

### Changed
- **Release Synchronization**: Published the latest `/details` CTA placement updates to Firebase Hosting and synchronized the release state to the GitHub `main` branch.

## [1.3.6] - 2026-05-22

### Changed
- **Details Section CTA Placement Fix**: Moved the "Read forensic engineering deep dive" button to the "The Last-Click Illusion" section on `/details`, while keeping "Read the full boardroom analysis" under the "A Fractional Chief Data Scientist in Your Boardroom" section.

## [1.3.5] - 2026-05-22

### Added
- **New Blog Post**: Added "The Mechanics of Marketing Forensic Engineering: Designing Data Pipelines for Capital Preservation" as a new dynamic article at `/blog/marketing-forensic-engineering-capital-preservation`.

### Changed
- **Cross-Linking Between Details and Blog**: Updated the `/details` "Fractional Chief Data Scientist" section with a direct internal link to the new forensic engineering article.
- **Article Backlink to Details**: Updated blog detail call-to-action routing to use internal navigation back to `/details`.
- **Forensic Post Visual Update**: Set the new forensic engineering article hero image to the pasted "2025-2026 Digital Marketing Crisis" infographic for on-page relevance.

## [1.3.4] - 2026-05-22

### Changed
- **Details-to-Blog Internal Navigation**: Added an internal link in the `/details` "Fractional Chief Data Scientist" section that routes to `/blog/fractional-chief-data-scientist` for deeper boardroom attribution analysis.

## [1.1.1] - 2026-05-22

### Added
- **Dynamic Blog Routing Architecture**: Implemented dynamic slug-based routing (`/blog/:slug`) via React Router to cleanly decouple views from content components.
- **Data-Driven Article Layer**: Created a unified storage structure at `src/data/blogPosts.js` to isolate editorial copy from core frontend rendering logic.

### Changed
- **Blog Hub Layout Refactor**: Converted monolithic static layout into a modular index view mapping data cards with explicit aspect-ratio containment on asset wrappers to mitigate Cumulative Layout Shift (CLS).

## [1.3.3] - 2026-05-22

### Chore
- **chore: configure Linux-specific and inherited metadata exclusions within .gitignore and clear local untracked cache noise**: Expanded `.gitignore` with `**/.DS_Store` (inherited macOS metadata), Linux system artifacts (`*~`, `*.swp`, `.lock`, `.Trash-*`), and `.firebase/` runtime cache. Removed the `.firebase/hosting.ZGlzdA.cache` file from git index tracking via `git rm --cached` without deleting the local asset. Repository staging state is now fully clean.

### Fixed
- fix: add responsive mobile media queries and stateful hamburger toggle to Navbar to restore smartphone route visibility

## [1.3.2] - 2026-05-22

### Fixed
- **Navbar Hero Rebuild**: Completely replaced the broken Tailwind-dependent navbar with a dedicated `src/Navbar.css` stylesheet using native CSS. Redesigned as a premium hero-style header with a centered pill navigation group (`Home · Concept · Contact · Blog · Privacy`), logo-left 
layout, and a gradient "Request Demo" CTA on the right. Added active route highlighting via `useLocation`. Eliminated all Tailwind utility class dependencies from the navbar layer to prevent silent resolution failures against the dark theme background.
- **New file `src/Navbar.css`**: Introduced a dedicated navbar stylesheet with glassmorphism pill container, per-link hover and active states, and a purple-to-blue gradient CTA button.

## [1.3.1] - 2026-05-22

### Hotfix
- **fix: correct navbar legibility, inject high-contrast text states, and fix horizontal flex spacing for dark mode theme**: Restructured `src/Navbar.jsx` with a clean `max-w-7xl` wrapper, enforced `gap-8` link group spacing, applied `text-gray-300 hover:text-white` contrast states to all navigation links, and styled the "Back to Homepage" CTA as a solid `bg-purple-600` enterprise anchor. Added `position: relative; z-index: 50` to the global `.navbar` rule in `index.css` to prevent hero canvas glow layers from clipping header text.

### UI & Architecture
- **Navigation Normalization Pass**: Standardized the global navigation bar (`src/Navbar.jsx`) across all views. Enforced exact 64px width scaling for the primary brand logo.
- **Structural Component Removals**: Purged redundant elements including the "View the Architecture" section from the Details layout, and the "Beta Early Access" and "Looking for a Proposal" structural cards from the Contact flow.
- **Text Adaptations**: Updated legacy layout buttons (previously labeled "Back to Waitlist") to output exactly "Back to Homepage" across the site.
- **Route Injection**: Added formal routing (`/blog`, `/privacy`) mapped to newly injected component files containing the engineering chronicles placeholder and institutional legal text.
## [1.3.0] - 2026-05-22

### Security
- **Global Edge-Security Configuration**: Injected global header protections into `firebase.json` for the root source (`**`), implementing `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a hardened, strictly scoped `Content-Security-Policy`.

### SEO & Architecture
- **Canonical Standardization**: Established absolute algorithmic truth by injecting `<link rel="canonical" href="https://marketmind-ai.com/" />` directly into the `index.html` head.
- **Nested Heading Integrity**: Corrected structural heading gaps by injecting explicit descriptive `<h2>` elements immediately following the existing `<h1>` instances across `Home.jsx`, `ComingSoon.jsx`, and `Contact.jsx`. Specifically overrode the Contact route to `<h1>Connect with MarketMind AI</h1>` and `<h2>Enterprise Data Engineering for Scale-Stage Portfolios</h2>`.
- **Crawlable Internal Routing**: Eliminated JavaScript-only dead-ends by replacing programmatic `useNavigate` clicks on brand logos and "Back to Waitlist" CTAs with semantic React Router `<Link>` components. Injected a dedicated fallback `<Link to="/" className="nav-back-link">Return to Home</Link>` on the Contact route to absolutely guarantee crawler escape.
- **Text Acceleration (Thin Content Remediation)**: Substantially expanded the body copy within `ComingSoon.jsx` and `Contact.jsx` to push individual page word counts past the 200-word indexation threshold. Built a dedicated "Architectural Integrity" container into the Contact route explicitly deploying specialized terminology: **Deterministic Data Layer**, **Decoupled Multi-Agent systems**, **Late-Stage Token Injection**, and **Systemic Inaction Accountability**.

## [1.2.0] - 2026-05-21

### Changed
- **Logo Visual Prominence**:
  - Increased navbar logo size from `48px` to `64px` for an authoritative, premium visual presence.
  - Scaled footer logo size proportionally from `32px` to `40px` to maintain correct visual hierarchy across all layouts.
  - Added a premium tracking and padding buffer around the logo container (`padding: 0.5rem 0.75rem` offset by negative margins) to provide proper breathing room.
  - Added subtle hover and active scale animations on the logo container for micro-interaction polish.
- **SEO & Page Title Standardization**:
  - Replaced the default placeholder page title with a descriptive marketing title: `"MarketMind-AI  FinOps for Marketing"`.
  - Configured `index.html` default template and added dynamic `useEffect` page title management across routes (`ComingSoon.jsx`, `Home.jsx`, `Contact.jsx`) to ensure correct presentation during navigation.

### Technical & Infrastructure
- **LCP Payload Optimization**: Compressed and resized `/MMAI-Dark.png` to a 500px maximum width, reducing file size by ~98% (from 4.06 MB to ~64 KB). Explicit `width="237"` and `height="112"` attributes were applied to logo image tags across components to prevent layout shifts.
- **SPA Routing & robots.txt**: Created a static `public/robots.txt` file specifying valid crawl directives and the sitemap location to override SPA catch-all routing.
- **Cache-Control Headers**: Updated `firebase.json` to configure explicit 1-year cache headers (`max-age=31536000, immutable`) for compiled `/assets/**` and 1-week headers for static base assets.
- **Meta Description**: Injected a complete and descriptive `<meta name="description">` tag into the `<head>` block of `index.html`.
- **Mobile Critical Path Optimization**: Resized and compressed the favicon to a lightweight 48x48 footprint (< 4 KB), and injected preconnect headers for Google Fonts and GTM in `index.html` to accelerate resource loading.
- **CLS Paint Optimization**: Enforced explicit `aspect-ratio: 237 / 112` and `contain: content` directives on the `.logo-img` class in `Home.css` to prevent rendering delays and layout shifts.
- **CSS Consolidations**: Centralized all shared `.navbar`, `.logo-container`, `.logo-img`, `.footer`, and `.footer-content` styles in `index.css` to act as the global source of truth across all routes (`/`, `/details`, `/contact`). Removed the redundant duplicates from `Home.css`.
- **Firebase Deployment**: Executed the client production build and deployed the validated bundle directly to Firebase Hosting for `marketmind-ai-website`.

## [1.1.0] - 2026-05-20

### Added
- **Global Google Analytics**: Integrated the Google Tag Manager (GTM) container `GTM-KNSPHJXZ` into the `<head>` and `<body>` of `index.html` to support unified event tracking.
- **Static Logo & Favicon Assets**: Added `MMAI-Dark.png` and `favicon.png` into the `public/` directory for static serving.
- **Interactive Logo & Back Navigation**:
  - Configured logo containers in both `ComingSoon.jsx` and `Home.jsx` to be clickable, routing users back to the Coming Soon landing page (`/`).
  - Added a "Back to Waitlist" secondary button on the right side of the navigation header on the details page (`/details`).
- **Internal Contact Page (/contact)**: Created a dedicated contact page displaying corporate details for SSR Research and Development, Inc., with support inquiries routed to `inquiries@marketmind-ai.com`. Header "Contact Us", "Request Demo", and "Book a Platform Tour" buttons now link directly to this page.
- **Waitlist Flow Migration**: Removed the local email-collection input form from the landing page (`/`) and replaced it with a direct "Request Beta Access" CTA button that navigates directly to the `/contact` page.

### Changed
- **Logo UI Refresh**:
  - Replaced the text-based placeholder logo (`M`) with the official `MMAI-Dark.png` image logo.
  - Removed duplicate text spans ("MarketMind AI") adjacent to the logo, as the new image logo already contains the company wordmark.
  - Increased the size of the navbar logo to `48px` (up from `36px`) and the footer logo to `32px` (up from `28px`) in `src/Home.css` for a more premium visual weight.
- **Favicon Integration**: Updated `index.html` to reference the new PNG favicon (`/favicon.png`) instead of the default Vite SVG icon.
- **Domain Mapping Transition**: Migrated project custom domain configuration in Firebase Hosting to the correct domain **`marketmind-ai.com`** (with hyphen) using GoDaddy nameservers (`ns43`/`ns44`).
- **Waitlist Success Screen**: Upgraded the thank-you panel inside `ComingSoon.jsx` to display a clean, security-first confirmation message stating that the user will be contacted soon (omitting any direct email printing).
- **Footer Credit Link**: Added a product ownership credit to the footer of all pages: *"MarketMind AI is a product of SSR Research and Development, Inc."* linking directly to `https://ssr-research.ai` with modern transitions.

### Technical & Infrastructure
- Cleaned up local styling overrides and compiled standard client bundles via Vite.
- Deployed all changes successfully to the Firebase Production Project (`marketmind-ai-website`).
