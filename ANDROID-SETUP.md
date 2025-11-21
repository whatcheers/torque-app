# Android App Setup Guide

This guide will help you convert your React/Vite web app into a native Android app using Capacitor.

## Prerequisites

1. **Node.js** (already installed)
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java Development Kit (JDK)** - Android Studio includes this
4. **Android SDK** - Installed via Android Studio

## Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When prompted:
- **App name**: Torque Calculator (or your preference)
- **App ID**: com.yourcompany.torqueapp (reverse domain notation)
- **Web dir**: dist

## Step 2: Update Vite Config

The `base` path needs to be changed for Capacitor:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // Change from '/torque-app/' to '/' for Capacitor
  // ... rest of config
})
```

## Step 3: Add Capacitor Scripts to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "android:build": "npm run build && npx cap sync android",
    "android:open": "npx cap open android",
    "android:run": "npm run android:build && npx cap run android"
  }
}
```

## Step 4: Build and Sync

```bash
# Build your web app
npm run build

# Sync to Android project
npx cap sync android
```

## Step 5: Open in Android Studio

```bash
npx cap open android
```

This will:
- Open Android Studio
- Load the Android project
- Let you build, run, and debug

## Step 6: Configure Android App

### App Icon
1. Replace `android/app/src/main/res/mipmap-*/ic_launcher.png` with your icon
2. Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/

### App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Torque Calculator</string>
</resources>
```

### Permissions (if needed)
Edit `android/app/src/main/AndroidManifest.xml` if you need:
- Internet access (for updates)
- Storage (if saving data)
- Camera (not needed for this app)

## Step 7: Build APK

### Debug APK (for testing)
1. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK will be in `android/app/build/outputs/apk/debug/`

### Release APK (for Google Play)
1. Generate a keystore (one-time):
   ```bash
   keytool -genkey -v -keystore torque-app-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias torque-app
   ```
2. Create `android/key.properties`:
   ```properties
   storePassword=your-store-password
   keyPassword=your-key-password
   keyAlias=torque-app
   storeFile=../torque-app-key.jks
   ```
3. Update `android/app/build.gradle` to use signing config
4. Build signed APK: Build → Generate Signed Bundle / APK

## Step 8: Testing

### On Emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create/Start a virtual device
4. Run the app

### On Physical Device
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run from Android Studio or use `npx cap run android`

## Required Changes Summary

1. ✅ Install Capacitor packages
2. ✅ Change `base` in `vite.config.ts` from `/torque-app/` to `/`
3. ✅ Add Android scripts to package.json
4. ✅ Build and sync
5. ✅ Configure app name, icon, permissions
6. ✅ Test on emulator/device

## Additional Considerations

### Offline Support
Your app should work offline since it doesn't require API calls. However, you can add:
- Service worker for full offline capability
- Cache strategies

### App Updates
- Publish updates via Google Play Store
- Or use Capacitor's live update features (requires additional setup)

### Performance
- Your app is already optimized with code splitting
- Capacitor adds minimal overhead (~2-3MB)

### Touch Optimization
- ✅ Already implemented in your app
- ✅ Large touch targets
- ✅ Mobile-friendly UI

## Troubleshooting

### Build Errors
- Ensure Android SDK is properly installed
- Check that Java/JDK version is compatible
- Clear cache: `npm run build && npx cap sync android --force`

### App Not Opening
- Check AndroidManifest.xml permissions
- Verify `base` path is `/` in vite.config.ts
- Ensure dist folder exists after build

### Icon Not Showing
- Regenerate icons using Android Asset Studio
- Clear app data and reinstall

## Next Steps

1. **Publish to Google Play**
   - Create Google Play Developer account ($25 one-time)
   - Prepare store listing, screenshots
   - Upload signed AAB (Android App Bundle)

2. **Add Native Features** (optional)
   - Capacitor plugins for device APIs
   - File system access
   - Haptic feedback
   - Share functionality

3. **iOS Version** (if needed)
   - Similar process with `@capacitor/ios`
   - Requires macOS and Xcode

## Alternative: PWA (Simpler, No Store)

If you want an installable app without Google Play:

1. Add `manifest.json` to `public/`
2. Add service worker for offline support
3. Users can "Add to Home Screen" from browser
4. No app store approval needed

See `PWA-SETUP.md` for PWA approach.




