# Native Splash Screen Guide

This guide describes how to configure seamless native launch screens and transition to React Native app bootstrap without white-screen flickering.

---

## 1. Native Splash Screen Setup

To achieve instant launch UI without blank frames before the JavaScript bundle loads, we recommend using `react-native-bootsplash`.

### Installation
```bash
npm install react-native-bootsplash
```

### Asset Generation
Generate all iOS Storyboard and Android XML drawable assets from a single SVG/PNG source icon:
```bash
npx react-native-bootsplash generate assets/logo.png \
  --background-color=FFFFFF \
  --logo-width=100 \
  --assets-path=assets \
  --flavor=main
```

---

## 2. iOS Configuration

1. In `ios/<ProjectName>/AppDelegate.mm`:
```objc
#import "RNBootSplash.h"

// Inside didFinishLaunchingWithOptions:
[RNBootSplash initWithStoryboard:@"BootSplash" rootView:self.window.rootViewController.view];
```

2. Set `BootSplash.storyboard` as the **Launch Screen File** in Xcode target settings.

---

## 3. Android Configuration

1. In `android/app/src/main/res/values/styles.xml`:
```xml
<!-- Set the theme for the splash screen -->
<style name="BootTheme" parent="Theme.BootSplash">
    <item name="bootSplashBackground">@color/bootsplash_background</item>
    <item name="bootSplashLogo">@drawable/bootsplash_logo</item>
</style>
```

2. In `android/app/src/main/AndroidManifest.xml`:
```xml
<activity
  android:name=".MainActivity"
  android:theme="@style/BootTheme"
  android:exported="true">
  ...
</activity>
```

3. In `android/app/src/main/java/.../MainActivity.kt`:
```kotlin
import com.zoontek.rnbootsplash.RNBootSplash

override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme)
    super.onCreate(savedInstanceState)
}
```

---

## 4. Hiding Splash Screen in React Native

In `App.tsx`, dismiss the native splash screen as soon as `bootstrap()` completes and your application state is ready:

```tsx
import React, { useEffect, useState } from 'react';
import { bootstrap } from './src/app/bootstrap';
import { App } from './src/app/App';
// import RNBootSplash from 'react-native-bootsplash';

const RootApp: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    bootstrap().then(result => {
      setConfig(result.config);
      setIsReady(result.isReady);
      // RNBootSplash.hide({ fade: true });
    });
  }, []);

  if (!isReady || !config) {
    return null;
  }

  return <App config={config} />;
};
```
