# Browser Extension Setup Guide

This guide will help you convert your React/Vite app into a browser extension that works in Chrome, Edge, Firefox, and other Chromium-based browsers.

## Extension Architecture

Your calculator will run as a **popup extension** - clicking the extension icon opens a popup window with the calculator.

## Step 1: Update Vite Config for Extension

The extension needs specific build settings:

```typescript
// vite.config.ts modifications needed:
// - Change base to '/' for extension
// - Configure build output for extension format
// - Ensure assets are properly referenced
```

## Step 2: Create Extension-Specific HTML

Extensions use `index.html` as the popup. Your existing HTML will work, but we may need minor adjustments.

## Step 3: Build Process

```bash
# Build for extension
npm run build:extension

# Or build normally (works for extension too)
npm run build
```

The `dist/` folder will contain the extension files.

## Step 4: Create Extension Icons

You'll need icon files at these sizes:
- 16x16 (toolbar icon)
- 32x32 (toolbar icon)
- 48x48 (extension management)
- 128x128 (Chrome Web Store)

Place them in `public/` folder as:
- `icon-16.png`
- `icon-32.png`
- `icon-48.png`
- `icon-128.png`

Or use an online tool like:
- https://www.favicon-generator.org/
- https://www.icoconverter.com/

## Step 5: Load Extension in Chrome/Edge

1. Build the extension:
   ```bash
   npm run build
   ```

2. Open Chrome/Edge:
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

3. Test the extension:
   - Click the extension icon in the toolbar
   - Popup should open with your calculator

## Step 6: Test & Debug

### View Console Logs
1. Right-click extension icon → "Inspect popup"
2. Or: Extensions page → Details → "Inspect views: popup"

### Common Issues

**Extension won't load:**
- Check `manifest.json` syntax
- Ensure all icon files exist
- Check console for errors

**Assets not loading:**
- Verify paths are relative (no `/torque-app/` prefix)
- Check Content Security Policy in manifest

**Popup too large:**
- Set popup size in CSS or via manifest (default ~600x600px)

## Step 7: Package for Distribution

### For Personal Use
1. Zip the `dist/` folder
2. Share the zip file
3. Others can load it as unpacked extension

### For Chrome Web Store (Optional)
1. Create a zip of `dist/` folder
2. Go to Chrome Web Store Developer Dashboard
3. Upload zip, add screenshots, description
4. Submit for review

## File Structure After Build

```
dist/
├── manifest.json          # Extension manifest
├── index.html            # Popup HTML
├── assets/               # JS, CSS bundles
│   ├── index-*.js
│   └── index-*.css
├── icon-16.png
├── icon-32.png
├── icon-48.png
└── icon-128.png
```

## Development Workflow

### Quick Development
```bash
# Watch mode (needs manual reload)
npm run dev

# Build and test
npm run build
# Then reload extension in chrome://extensions/
```

### Hot Reload (Optional)
For better DX, you can use:
- `vite-plugin-web-extension` (more complex setup)
- Or manually reload extension after each build

## Browser Compatibility

- ✅ **Chrome** (Manifest V3)
- ✅ **Edge** (Manifest V3)
- ✅ **Brave** (Manifest V3)
- ✅ **Opera** (Manifest V3)
- ⚠️ **Firefox** (needs Manifest V2 or V3 conversion)
- ❌ **Safari** (different format, needs separate build)

## Features That Work Great in Extensions

Your calculator is perfect for extension because:
- ✅ Self-contained (no API calls)
- ✅ Fast calculations
- ✅ Works offline
- ✅ Small footprint
- ✅ No permissions needed

## Optional Enhancements

### Keyboard Shortcuts
Add to `manifest.json`:
```json
"commands": {
  "open-calculator": {
    "suggested_key": {
      "default": "Ctrl+Shift+T",
      "mac": "Command+Shift+T"
    },
    "description": "Open Torque Calculator"
  }
}
```

### Context Menu (if needed)
```json
"permissions": ["contextMenus"],
"background": {
  "service_worker": "background.js"
}
```

### Storage (for saving preferences)
```json
"permissions": ["storage"]
```

Then use `chrome.storage.local` API to save user preferences.

## Troubleshooting

### Popup Window Size
If popup is too small, you can:
1. Use `chrome.action.setPopup()` in background script
2. Or create options page (full page) instead of popup
3. Or use `chrome.windows.create()` for new window

### Content Security Policy
Extensions have strict CSP. If you add external resources:
- Use `"content_security_policy": { "extension_pages": "..." }` 
- Or host resources locally in extension

### React DevTools
Works in extension popup:
1. Right-click popup → Inspect
2. React DevTools extension will work

## Next Steps

1. ✅ Build extension format
2. ✅ Create icons
3. ✅ Load in Chrome/Edge
4. ✅ Test all functionality
5. ✅ Package for sharing
6. ⭐ (Optional) Publish to Chrome Web Store




