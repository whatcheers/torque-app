# Load Chrome Extension - Quick Guide

## ✅ Extension is Ready!

Your extension has been built successfully. Here's how to load it:

## Step 1: Open Chrome Extensions Page

1. Open Google Chrome
2. Go to: `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage extensions

## Step 2: Enable Developer Mode

1. Toggle **"Developer mode"** switch in the top-right corner

## Step 3: Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to: `/home/whatcheer/torque-app/dist`
3. Select the `dist` folder
4. Click "Select Folder"

## Step 4: Test It!

1. Look for the "Torque Calculator" icon in your Chrome toolbar
2. Click the icon to open the popup
3. Your calculator should appear in a popup window!

## Rebuilding After Changes

If you make code changes:

```bash
npm run build:extension
```

Then in Chrome:
1. Go to `chrome://extensions/`
2. Find "Torque Calculator"
3. Click the refresh icon (🔄) on the extension card

## Troubleshooting

**Extension won't load:**
- Make sure you selected the `dist` folder, not the root folder
- Check browser console for errors (right-click extension icon → Inspect popup)

**Icons not showing:**
- Verify `dist/icon-*.png` files exist
- Check `dist/manifest.json` has correct icon paths

**Popup not opening:**
- Check browser console for JavaScript errors
- Verify `dist/index.html` exists

## Package for Sharing

To share your extension:

```bash
cd dist
zip -r ../torque-calculator-extension.zip .
```

Share the zip file. Others can load it the same way (Load unpacked → extract zip → select folder).

## Publish to Chrome Web Store (Optional)

1. Create a zip of the `dist` folder
2. Go to Chrome Web Store Developer Dashboard
3. Upload zip, add screenshots/description
4. Submit for review ($5 one-time developer fee)

