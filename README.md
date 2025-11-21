# Bottle Cap Torque Calculator

A production-ready web application for calculating bottle cap application and removal torque from cap diameter.

## Features

- **Multiple Calculation Modes**:
  - Industry-standard reference tables for common closure sizes (24mm to 110mm)
  - 50% rule of thumb calculation with ±20% tolerance band
  - Automatic fallback to rule when table entry unavailable

- **Unit Support**:
  - US customary (in-lb)
  - Metric (N·m)

- **Advanced Features**:
  - Debug mode showing step-by-step calculations
  - Adjustable removal percentage (30-70% of application torque)
  - Copy results as JSON
  - Responsive design for mobile and desktop

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Bundle installable PWA (copy dist/ to hosting)
npm run build
```

## Progressive Web App

- `public/site.webmanifest` and `public/service-worker.js` enable add-to-home-screen plus offline caching.
- Deploy the `dist/` folder to HTTPS hosting; browsers will surface an Install button and run the service worker.
- Service worker registration only runs in production builds and is skipped inside the browser extension.
- Replace the placeholder icons referenced in the manifest with branded `192x192` and `512x512` PNGs for best install prompts.

