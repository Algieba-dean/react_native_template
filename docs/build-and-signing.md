# Build, Code Signing, and Delivery Guide

This document outlines the standard end-to-end procedures for compiling, signing, and delivering release packages (APK, AAB, and IPA) for projects derived from this template.

---

## 1. Android Build & Signing

### 1.1 Debug vs. Release Signing Boundary

By default in development, Android uses `android/app/debug.keystore` (with alias `androiddebugkey` and password `android`).
**Never use the debug keystore for production releases.** A release signed with a debug key cannot be uploaded to Google Play Console and is insecure.

### 1.2 Generating a Production Keystore

Generate a secure release keystore using the Java `keytool` utility:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
  -alias my-release-key -keyalg RSA -keysize 2048 -validity 10000
```

Store this file securely (e.g. 1Password, cloud vault) and **never commit it to Git**.

### 1.3 Configuring Keystore Properties

Create `android/key.properties` (which is excluded in `.gitignore`):

```properties
RELEASE_STORE_FILE=release.keystore
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_ALIAS=my-release-key
RELEASE_KEY_PASSWORD=your_key_password
```

In `android/app/build.gradle`, load these properties when available:

```groovy
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['RELEASE_STORE_FILE'])
                storePassword keystoreProperties['RELEASE_STORE_PASSWORD']
                keyAlias keystoreProperties['RELEASE_KEY_ALIAS']
                keyPassword keystoreProperties['RELEASE_KEY_PASSWORD']
            } else {
                signingConfig signingConfigs.debug
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### 1.4 Generating Release Artifacts

```bash
cd android

# 1. Clean previous build artifacts
./gradlew clean

# 2. Build Universal Release APK (for direct sideloading or internal QA)
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# 3. Build Android App Bundle (AAB, required for Google Play store publishing)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 1.5 16KB Page Size Compatibility

Android 15 (API level 35) requires native binary libraries to support 16KB memory page sizes. This template includes the required CMake linker flags in `android/app/build.gradle` and `android/build.gradle`:

```groovy
externalNativeBuild {
    cmake {
        arguments "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON", "-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-z,max-page-size=16384"
    }
}
```

---

## 2. iOS Archive, Signing, and Export

### 2.1 Simulator vs. Physical Device Boundary

- **Simulator builds** (`.app` in `ios/build/Build/Products/Debug-iphonesimulator/`) run purely on the macOS Simulator architecture (x86_64 / arm64). They are unsigned and **cannot be installed on physical iOS hardware**.
- **Physical device builds** (`.ipa`) require code signing with a valid Apple Developer Certificate and an associated Provisioning Profile (Development, Ad-Hoc, or App Store).

### 2.2 CocoaPods Setup

Before building on iOS, ensure native pods are resolved:

```bash
# Using bundled Ruby environment
bundle install
bundle exec pod install --project-directory=ios
```

### 2.3 Command-Line Archive & Export

To generate an `.ipa` via command line:

```bash
# 1. Create Xcode Archive
xcodebuild -workspace ios/EnterpriseReactNativeTemplate.xcworkspace \
  -scheme EnterpriseReactNativeTemplate \
  -configuration Release \
  -archivePath ios/build/EnterpriseReactNativeTemplate.xcarchive \
  clean archive

# 2. Export Archive to IPA using ExportOptions.plist
xcodebuild -exportArchive \
  -archivePath ios/build/EnterpriseReactNativeTemplate.xcarchive \
  -exportPath ios/build/output \
  -exportOptionsPlist ios/ExportOptions.plist
```

Example `ios/ExportOptions.plist` for Ad-Hoc distribution:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>signingStyle</key>
    <string>manual</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

### 2.4 Fastlane Alignment

For automated CI/CD code signing and distribution, use `fastlane match` and `fastlane gym`. Refer to `docs/fastlane.md` for lane configurations.
