#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📱 Checking iOS Simulator status..."

# Find all booted devices
BOOTED_DEVICES=$(xcrun simctl list devices | grep "Booted" | sed -E 's/.*\(([0-9A-F-]+)\).*/\1/')

if [ -z "$BOOTED_DEVICES" ]; then
  echo "⚡ No simulator currently booted. Finding available iPhone simulator..."
  TARGET_DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 16 Pro" | head -n 1 | sed -E 's/.*\(([0-9A-F-]+)\).*/\1/')
  if [ -z "$TARGET_DEVICE_ID" ]; then
    TARGET_DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 15 Pro" | grep -v "unavailable" | head -n 1 | sed -E 's/.*\(([0-9A-F-]+)\).*/\1/')
  fi
  if [ -z "$TARGET_DEVICE_ID" ]; then
    TARGET_DEVICE_ID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -n 1 | sed -E 's/.*\(([0-9A-F-]+)\).*/\1/')
  fi
  echo "🚀 Booting simulator ($TARGET_DEVICE_ID)..."
  xcrun simctl boot "$TARGET_DEVICE_ID" || true
  BOOTED_DEVICES="$TARGET_DEVICE_ID"
fi

# Locate built app bundle
APP_PATH="$PROJECT_DIR/ios/build/Build/Products/Debug-iphonesimulator/EnterpriseReactNativeTemplate.app"

if [ ! -d "$APP_PATH" ] || [ "$1" = "--rebuild" ] || [ "$REBUILD" = "1" ] || [ "$FORCE_REBUILD" = "1" ]; then
  FIRST_DEV=$(echo "$BOOTED_DEVICES" | head -n 1)
  echo "🔨 Building for iOS simulator with xcodebuild..."
  xcodebuild -workspace ios/EnterpriseReactNativeTemplate.xcworkspace \
    -scheme EnterpriseReactNativeTemplate \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination "id=$FIRST_DEV" \
    -derivedDataPath ios/build \
    COMPILER_INDEX_STORE_ENABLE=NO
  APP_PATH="$PROJECT_DIR/ios/build/Build/Products/Debug-iphonesimulator/EnterpriseReactNativeTemplate.app"
fi

# Determine bundle identifier from Info.plist
BUNDLE_ID=""
if [ -f "$APP_PATH/Info.plist" ]; then
  BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist" 2>/dev/null || echo "")
fi
if [ -z "$BUNDLE_ID" ]; then
  BUNDLE_ID="com.enterprise.reactnativetemplate"
fi

# Install and launch on ALL booted simulators
for DEV_ID in $BOOTED_DEVICES; do
  echo "📦 Installing application to simulator ($DEV_ID)..."
  xcrun simctl install "$DEV_ID" "$APP_PATH"

  echo "✨ Launching $BUNDLE_ID on simulator ($DEV_ID)..."
  xcrun simctl terminate "$DEV_ID" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl launch "$DEV_ID" "$BUNDLE_ID"
done

echo "🎉 App launched successfully on all active simulators!"
