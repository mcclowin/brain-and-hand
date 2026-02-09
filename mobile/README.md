# Brain & Hand Mobile App

Runs OpenClaw locally on your Android phone.

## Quick Start (Laptop)

### Prerequisites
- Node.js 18+
- Android Studio with SDK installed
- USB cable + Android phone with USB debugging enabled

### Setup

```bash
# Clone the repo
git clone git@github.com:mcclowin/brain-and-bot.git
cd brain-and-bot

# Run setup script
chmod +x mobile/setup.sh
./mobile/setup.sh

# Run on connected phone
cd rn-app
npx react-native run-android
```

### Build APK only (no phone connected)

```bash
cd rn-app/android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Architecture

```
┌─────────────────────────────────────┐
│  React Native UI (App.tsx)          │
│  - Wizard, Dashboard, Chat          │
└───────────────┬─────────────────────┘
                │ rn-bridge
┌───────────────▼─────────────────────┐
│  Node.js (nodejs-mobile)            │
│  - nodejs-assets/nodejs-project/    │
│  - main.js handles commands         │
└───────────────┬─────────────────────┘
                │ (future)
┌───────────────▼─────────────────────┐
│  OpenClaw Gateway                   │
│  - LLM calls, Telegram, etc.        │
└─────────────────────────────────────┘
```

## Files

- `mobile/App.tsx` - Main React Native UI
- `mobile/setup.sh` - Setup script
- `nodejs-assets/nodejs-project/main.js` - Node.js entry point
