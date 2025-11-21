# Browser Extension - Quick Start Guide

## ✅ What's Already Done

1. ✅ Extension manifest (`public/manifest.json`) - Configured for Chrome/Edge
2. ✅ Vite config updated - Supports extension build mode
3. ✅ Build script added - `npm run build:extension`
4. ✅ HTML updated - Popup sizing configured

## 🎯 Quick Start (5 minutes)

### Step 1: Create Extension Icons

You need 4 icon files in `public/`:
- `icon-16.png` (16×16)
- `icon-32.png` (32×32)  
- `icon-48.png` (48×48)
- `icon-128.png` (128×128)

**Quick option:** Use any image editor or online tool:
- https://www.favicon-generator.org/
- Or create simple colored squares with "TC" text

See `public/create-icons.md` for details.

### Step 2: Build Extension

```bash
npm run build:extension
```

This creates the extension in `dist/` folder.

### Step 3: Load in Chrome/Edge

1. Open Chrome: `chrome://extensions/`
   (Or Edge: `edge://extensions/`)

2. Enable **Developer mode** (toggle top right)

3. Click **"Load unpacked"**

4. Select the `dist/` folder

5. Done! Click the extension icon to open your calculator

## 📦 Package for Sharing

To share the extension:

```bash
# Build extension
npm run build:extension

# Create zip file
cd dist
zip -r ../torque-calculator-extension.zip .
```

Share the `.zip` file. Others can load it as unpacked extension.

## 🐛 Debugging

**View console/logs:**
- Right-click extension icon → "Inspect popup"
- Or: Extensions page → Details → "Inspect views: popup"

**Common issues:**
- **Icons missing:** Create the 4 icon PNG files
- **Extension won't load:** Check browser console for errors
- **Assets not loading:** Verify build completed successfully

## 🎨 Customization

### Change Popup Size
Edit `index.html` style tag:
```css
width: 600px;  /* Change width */
min-height: 700px;  /* Change height */
```

### Change Extension Name
Edit `public/manifest.json`:
```json
"name": "Your Custom Name",
"description": "Your description"
```

## ✅ You're Done!

Your calculator is now a browser extension. Users can:
- Click extension icon for instant access
- Use it offline
- Keep it always available in their browser

## 🚀 Next Steps (Optional)

1. **Publish to Chrome Web Store**
   - Create Developer account ($5 one-time)
   - Upload zip, add screenshots
   - Submit for review

2. **Add Keyboard Shortcut**
   - Edit `manifest.json` (see EXTENSION-SETUP.md)

3. **Add Storage** (save user preferences)
   - Use `chrome.storage.local` API

For more details, see `EXTENSION-SETUP.md`.




