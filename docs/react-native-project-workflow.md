# React Native Project Workflow

## Prerequisites

- Node.js >= 18
- Watchman (macOS: `brew install watchman`)
- iOS: Xcode & CocoaPods (`sudo gem install cocoapods`)
- Android: Android Studio & JDK 17+

## Daily Development Workflow

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Metro bundler**:
   ```bash
   npm start
   ```

3. **Launch on iOS Simulator**:
   ```bash
   npm run ios
   ```

4. **Launch on Android Emulator / Device**:
   ```bash
   npm run android
   ```

5. **Run Verification Suite**:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
