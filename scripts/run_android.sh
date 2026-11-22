#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Ensure ANDROID_HOME and PATH are set
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

if ! command -v adb >/dev/null 2>&1; then
  echo "❌ Error: adb not found. Please verify Android SDK is installed at $ANDROID_HOME."
  exit 1
fi

echo "🤖 Checking Android devices and emulators..."

# Check if a device or emulator is already connected
ONLINE_DEVICE=$(adb devices | grep -w "device" | head -n 1 | awk '{print $1}')

if [ -z "$ONLINE_DEVICE" ]; then
  echo "⚡ No Android device or emulator currently running."
  AVD_NAME=$(emulator -list-avds 2>/dev/null | head -n 1)

  if [ -z "$AVD_NAME" ]; then
    echo "❌ No Android Virtual Device (AVD) found."
    echo "💡 Please open Android Studio -> Virtual Device Manager and create an emulator."
    exit 1
  fi

  echo "🚀 Launching Android Emulator: $AVD_NAME ..."
  nohup emulator -avd "$AVD_NAME" >/dev/null 2>&1 &

  echo "⏳ Waiting for Android emulator to boot up..."
  adb wait-for-device
  
  # Wait until system boot is completed
  while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 2
  done
  echo "✅ Android emulator is ready!"
fi

echo "📦 Compiling and installing application on Android device..."
npx react-native run-android --no-packager

echo "🎉 Android app launched successfully!"
