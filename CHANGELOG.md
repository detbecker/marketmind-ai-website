# Changelog

All notable changes to the **MarketMind AI Website** project will be documented in this file.

## [1.2.0] - 2026-05-21

### Changed
- **Logo Visual Prominence**:
  - Increased navbar logo size from `48px` to `64px` for an authoritative, premium visual presence.
  - Scaled footer logo size proportionally from `32px` to `40px` to maintain correct visual hierarchy across all layouts.
  - Added a premium tracking and padding buffer around the logo container (`padding: 0.5rem 0.75rem` offset by negative margins) to provide proper breathing room.
  - Added subtle hover and active scale animations on the logo container for micro-interaction polish.
- **SEO & Page Title Standardization**:
  - Replaced the default placeholder page title with a descriptive marketing title: `"MarketMindAI- AI Data Analytics"`.
  - Configured `index.html` default template and added dynamic `useEffect` page title management across routes (`ComingSoon.jsx`, `Home.jsx`, `Contact.jsx`) to ensure correct presentation during navigation.

### Technical & Infrastructure
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
