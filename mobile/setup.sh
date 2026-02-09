#!/bin/bash
# Brain and Hand - Quick Setup Script
# Run this on your laptop with Android SDK installed

set -e

echo "🧠 Brain & Hand - Setup"
echo "======================="

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install npm"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Create React Native project
echo ""
echo "📱 Creating React Native project..."
cd "$(dirname "$0")/.."

if [ -d "rn-app" ]; then
    echo "⚠️  rn-app already exists, skipping init"
else
    npx react-native init BrainAndHandApp --template react-native-template-typescript --directory rn-app
fi

cd rn-app

# Install nodejs-mobile
echo ""
echo "📦 Installing nodejs-mobile..."
npm install nodejs-mobile-react-native --save

# Copy our files
echo ""
echo "📋 Copying Brain & Hand code..."

# Copy App.tsx
cp ../mobile/App.tsx ./App.tsx

# Copy nodejs-assets
mkdir -p android/app/src/main/assets/nodejs-assets/nodejs-project
cp -r ../nodejs-assets/nodejs-project/* android/app/src/main/assets/nodejs-assets/nodejs-project/

# Install node deps for the embedded Node.js project
echo ""
echo "📦 Installing Node.js project dependencies..."
cd android/app/src/main/assets/nodejs-assets/nodejs-project
npm install --production 2>/dev/null || true
cd ../../../../../../..

# Clean gradle
echo ""
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean 2>/dev/null || true
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Connect your Android phone via USB (with USB debugging enabled)"
echo "  2. Run: cd rn-app && npx react-native run-android"
echo ""
echo "Or to build APK for manual install:"
echo "  cd rn-app/android && ./gradlew assembleDebug"
echo "  APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
