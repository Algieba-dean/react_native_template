# React Native New Architecture Guide

This template is configured to be 100% compatible with React Native's **New Architecture** (TurboModules, Fabric Renderer, and Bridgeless Mode).

---

## 1. Overview of New Architecture Components

1. **TurboModules**:
   - Modern native modules based on JSI (JavaScript Interface) allowing synchronous and direct C++ / native invocation without JSON serialization overhead over the old bridge.
2. **Fabric Renderer**:
   - Next-generation UI rendering engine using C++ core for thread-safe UI layout calculation and seamless synchronous rendering.
3. **Bridgeless Mode**:
   - Fully removes the legacy React Native bridge. All module communication and lifecycle management run via JSI.
4. **Hermes Engine**:
   - Pre-compiled bytecode JavaScript engine optimized for rapid startup times and low memory footprints.

---

## 2. Enabling and Configuring New Architecture

### iOS Configuration
In `ios/Podfile`:
```ruby
use_react_native!(
  :path => config[:reactNativePath],
  # Enables the New Architecture (Fabric & TurboModules)
  :fabric_enabled => true,
  :hermes_enabled => true
)
```

Run CocoaPods installation:
```bash
cd ios && pod install
```

### Android Configuration
In `android/gradle.properties`:
```properties
# Enable New Architecture
newArchEnabled=true
# Enable Hermes
hermesEnabled=true
```

---

## 3. Writing TurboModules & Fabric Components

When authoring custom native modules or views:
1. Define TypeScript / Flow spec with TypeScript interfaces (`TurboModule` from `react-native`).
2. Run Codegen to generate C++ interfaces and Android/iOS native binding scaffolds.
3. Implement the native methods matching the generated C++ specs.

### Verification Checklist
- [x] No deprecated React Native legacy modules (`AsyncStorage` core, legacy `SafeAreaView`).
- [x] Use `react-native-screens` with Fabric enablement.
- [x] Use `react-native-safe-area-context` with TurboModule bindings.
- [x] All native dependencies declare TurboModule / Fabric support.
