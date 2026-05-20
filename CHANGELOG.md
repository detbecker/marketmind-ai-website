# Changelog

All notable changes to the **MarketMind AI Website** project will be documented in this file.

## [1.1.0] - 2026-05-20

### Added
- **Global Google Analytics**: Integrated the Google Tag (gtag.js) script with measurement ID `G-E2EGBB88KM` into the `<head>` of `index.html` to enable page-view and user tracking across all current and future routes.
- **Static Logo & Favicon Assets**: Added `MMAI-Dark.png` and `favicon.png` into the `public/` directory for static serving.
- **Interactive Logo & Back Navigation**:
  - Configured logo containers in both `ComingSoon.jsx` and `Home.jsx` to be clickable, routing users back to the Coming Soon landing page (`/`).
  - Added a "Back to Waitlist" secondary button on the right side of the navigation header on the details page (`/details`).
- **Internal Contact Page (/contact)**: Created a dedicated contact page displaying corporate details for SSR Research and Development, Inc. (phone, email, proposal guidance, tagline, and beta waitlist access), fully styled with matching dark-mode glassmorphic aesthetics. Header "Contact Us", "Request Demo", and "Book a Platform Tour" buttons now link directly to this page.

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
