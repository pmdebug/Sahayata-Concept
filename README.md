# Saathi Layer v2 — Universal Digital Accessibility Suite

Digital experiences should be easy for everyone to use. **Saathi Layer v2** bridges accessibility gaps caused by visual impairments, photosensitive epilepsy, language barriers, cognitive overload, and motor limitations.

## Folder Structure

```text
saathi-layer-v2/
├── README.md          # Project documentation and setup guide
├── demo/              # Interactive testbench webpage to test all accessibility features
│   ├── index.html     # Test page with animations, color-only UI, clutter & multilingual text
│   ├── demo.css       # Styling for the interactive demo environment
│   └── demo.js        # Demo interactions and live complexity simulation
├── extension/         # Chrome / Edge / Brave Manifest V3 Browser Extension
│   ├── manifest.json  # Extension configuration
│   ├── popup.html     # Extension popup control panel
│   ├── popup.js       # Popup controller & complexity analyzer
│   ├── content.js     # In-page accessibility engine & voice controller
│   └── styles.css     # Injected accessibility styles & symbol overlays
└── sdk/               # Embeddable Web SDK for developers
    ├── saathi-sdk.js  # Drop-in floating accessibility widget & voice assistant
    └── saathi-sdk.css # Styles for the embeddable SDK widget
```

---

## Key Features

1. **Colorblind Assist & Semantic Symbols**
   - Adds distinct visual symbols (`🔗` for links, `🔘` for buttons, `⚠️` for warnings, `✅` for success, `❌` for errors) so users never rely on color alone.
   - Includes SVG color matrices for **Protanopia**, **Deuteranopia**, **Tritanopia**, and **High Contrast**.
2. **Epilepsy Safe Mode & Flash Guard**
   - Instantly freezes CSS animations, transitions, marquee scrolls, and auto-playing videos/canvas loops.
   - Detects rapid animation counts and warns users via the Complexity Meter.
3. **Page Complexity Meter & Simplifier**
   - Calculates a real-time **Complexity Score (Low / Medium / High)** based on DOM depth, node count, active animations, and visual clutter.
   - One-click **Simplify Mode** strips away sidebars, popups, banners, and distractions while enlarging typography.
4. **Easy Translate & Read Aloud (TTS)**
   - Translate highlighted text or the entire webpage into English, Hindi, Spanish, French, and more.
   - Built-in Text-to-Speech (TTS) reads selected passages aloud.
5. **Voice-Controlled Accessibility**
   - Hands-free navigation powered by the Web Speech API.
   - Supported voice commands:
     - `"scroll down"` / `"scroll up"` / `"top"`
     - `"epilepsy"` (toggles Epilepsy Safe Mode)
     - `"colorblind"` (toggles Colorblind Symbols & Contrast)
     - `"simplify"` (toggles Distraction-Free Reader Mode)
     - `"translate"` (translates selected text or page)
     - `"read"` (reads selected text aloud)

---

## Quick Start

### Option A: Load the Browser Extension (`extension/`)
1. Open Chrome, Edge, or Brave and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `extension` folder inside `saathi-layer-v2`.
4. Pin **Saathi Accessibility Layer** to your toolbar and open it on any website.

### Option B: Try the Interactive Demo (`demo/`)
1. Open `demo/index.html` directly in your browser.
2. The page pre-loads the **Saathi SDK** floating widget in the bottom-right corner and includes test zones for colorblind buttons, flashing hazards, cluttered layouts, and translation.

### Option C: Embed the SDK in Any Website (`sdk/`)
Add these two lines to any HTML page:
```html
<link rel="stylesheet" href="sdk/saathi-sdk.css">
<script src="sdk/saathi-sdk.js"></script>
```
