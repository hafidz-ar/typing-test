# Typing Test

A browser-based typing speed and accuracy test app supporting English and Indonesian. Built with pure HTML, CSS, and JavaScript — no frameworks, no build step.

## Features

- Language selection: English and Indonesian
- Session durations: 15s, 30s, 60s, and 120s
- Real-time character feedback (correct/wrong highlighting)
- WPM and accuracy scoring at the end of each session
- Reset anytime via button or `Tab + Enter` shortcut
- Neobrutalism design — bold borders, solid shadows, high-contrast colors
- Responsive layout from 1080p up to 4K (3840×2160)

## Tech Stack

- Pure HTML / CSS / JavaScript (ES Modules)
- No frameworks, no backend, no build step required
- [fast-check](https://fast-check.io/) for property-based testing

## Getting Started

Open `typing-test-website/index.html` directly in your browser — no server needed.

## Running Tests

```bash
# Install dependencies
npm install

# Run tests (single pass)
npx jest --runInBand
```

## Project Structure

```
typing-test-website/
├── index.html           # Main page
├── style.css            # Neobrutalism design system
└── js/
    ├── app.js           # Entry point & state management
    ├── wordData.js      # Word lists (English & Indonesian)
    ├── textGenerator.js # Text generation logic
    ├── inputValidator.js  # Character validation (pure functions)
    ├── scoreCalculator.js # WPM & accuracy calculation (pure functions)
    ├── timer.js         # Session timer
    └── uiRenderer.js    # DOM rendering & UI updates
```
