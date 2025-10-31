# Bottle Cap Torque Calculator

A production-ready web application for calculating bottle cap application and removal torque from cap diameter.

## Features

- **Multiple Calculation Modes**:
  - Industry-standard reference tables for common closure sizes (24mm to 110mm)
  - 50% rule of thumb calculation with ±20% tolerance band
  - Automatic fallback to rule when table entry unavailable

- **Unit Support**:
  - Inch-pounds (in-lb)
  - Newton-meters (N·m)
  - Kilogram-force centimeters (kgf·cm)

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
```

