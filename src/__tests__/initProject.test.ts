import fs from 'fs';
import path from 'path';
import os from 'os';

const { parseArgs, sanitizeName, configureProject } = require('../../tool/init_project');

describe('Project Initializer (tool/init_project.js)', () => {
  describe('parseArgs', () => {
    it('parses short flags correctly', () => {
      const args = ['-n', 'my-test-app', '-d', 'Test App', '-b', 'com.test.app', '-y'];
      const parsed = parseArgs(args);
      expect(parsed.name).toBe('my-test-app');
      expect(parsed.displayName).toBe('Test App');
      expect(parsed.bundleId).toBe('com.test.app');
      expect(parsed.yes).toBe(true);
    });

    it('parses long flags with equals signs and quotes', () => {
      const args = [
        '--name="quote-app"',
        '--display-name="Quoted Display"',
        '--bundle-id="com.quote.pkg"',
        '--reset-git=true',
      ];
      const parsed = parseArgs(args);
      expect(parsed.name).toBe('quote-app');
      expect(parsed.displayName).toBe('Quoted Display');
      expect(parsed.bundleId).toBe('com.quote.pkg');
      expect(parsed.resetGit).toBe(true);
    });

    it('parses --help flag', () => {
      const parsed = parseArgs(['-h']);
      expect(parsed.help).toBe(true);
    });
  });

  describe('sanitizeName', () => {
    it('strips dashes, spaces, and special symbols', () => {
      expect(sanitizeName('my-awesome-app')).toBe('myawesomeapp');
      expect(sanitizeName('Super App 2026!')).toBe('SuperApp2026');
      expect(sanitizeName('')).toBe('');
    });
  });

  describe('configureProject end-to-end transformation', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rn-init-test-'));

      // Create mock project file structure
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify({ name: 'enterprise-react-native-template', version: '1.0.0' }),
      );

      fs.writeFileSync(
        path.join(tempDir, 'app.json'),
        JSON.stringify({
          name: 'EnterpriseReactNativeTemplate',
          displayName: 'Enterprise RN',
        }),
      );

      fs.writeFileSync(
        path.join(tempDir, '.env.development'),
        'APP_ENV=development\nAPP_TITLE="Enterprise RN Template"\n',
      );

      // Android files
      const androidAppDir = path.join(tempDir, 'android/app');
      fs.mkdirSync(androidAppDir, { recursive: true });
      fs.writeFileSync(
        path.join(androidAppDir, 'build.gradle'),
        'namespace "com.enterprisereactnativetemplate"\napplicationId "com.enterprisereactnativetemplate"\n',
      );

      const androidResDir = path.join(androidAppDir, 'src/main/res/values');
      fs.mkdirSync(androidResDir, { recursive: true });
      fs.writeFileSync(
        path.join(androidResDir, 'strings.xml'),
        '<resources>\n  <string name="app_name">EnterpriseReactNativeTemplate</string>\n</resources>',
      );

      fs.writeFileSync(
        path.join(tempDir, 'android/settings.gradle'),
        "rootProject.name = 'EnterpriseReactNativeTemplate'\n",
      );

      const oldJavaDir = path.join(
        androidAppDir,
        'src/main/java/com/enterprisereactnativetemplate',
      );
      fs.mkdirSync(oldJavaDir, { recursive: true });
      fs.writeFileSync(
        path.join(oldJavaDir, 'MainActivity.kt'),
        'package com.enterprisereactnativetemplate\nclass MainActivity {\n  override fun getMainComponentName(): String = "EnterpriseReactNativeTemplate"\n}\n',
      );

      // iOS files
      const iosDir = path.join(tempDir, 'ios/EnterpriseReactNativeTemplate');
      fs.mkdirSync(iosDir, { recursive: true });
      const xcodeDir = path.join(tempDir, 'ios/EnterpriseReactNativeTemplate.xcodeproj');
      fs.mkdirSync(xcodeDir, { recursive: true });

      fs.writeFileSync(
        path.join(xcodeDir, 'project.pbxproj'),
        'PRODUCT_BUNDLE_IDENTIFIER = com.enterprise.reactnativetemplate;\n',
      );

      fs.writeFileSync(
        path.join(iosDir, 'AppDelegate.mm'),
        '- (BOOL)application {\n  self.moduleName = @"EnterpriseReactNativeTemplate";\n  return YES;\n}\n',
      );

      fs.writeFileSync(
        path.join(iosDir, 'Info.plist'),
        '<key>CFBundleDisplayName</key>\n\t<string>EnterpriseReactNativeTemplate</string>\n',
      );

      fs.writeFileSync(
        path.join(iosDir, 'LaunchScreen.storyboard'),
        '<label text="EnterpriseReactNativeTemplate" />\n',
      );

      const scriptsDir = path.join(tempDir, 'scripts');
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(
        path.join(scriptsDir, 'run_ios.sh'),
        'BUNDLE_ID="com.enterprise.reactnativetemplate"\n',
      );
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('transforms project files, relocates Kotlin packages, and syncs iOS moduleName', () => {
      configureProject(tempDir, {
        projectName: 'demo-app',
        displayName: 'Demo Application',
        bundleId: 'com.myorg.demoapp',
        resetGit: false,
      });

      // 1. package.json
      const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf8'));
      expect(pkg.name).toBe('demo-app');

      // 2. app.json
      const appJson = JSON.parse(fs.readFileSync(path.join(tempDir, 'app.json'), 'utf8'));
      expect(appJson.name).toBe('demoapp');
      expect(appJson.displayName).toBe('Demo Application');

      // 3. Android build.gradle & strings.xml
      const gradle = fs.readFileSync(path.join(tempDir, 'android/app/build.gradle'), 'utf8');
      expect(gradle).toContain('namespace "com.myorg.demoapp"');
      expect(gradle).toContain('applicationId "com.myorg.demoapp"');

      const strings = fs.readFileSync(
        path.join(tempDir, 'android/app/src/main/res/values/strings.xml'),
        'utf8',
      );
      expect(strings).toContain('<string name="app_name">Demo Application</string>');

      // 4. Android Kotlin files relocation & component name sync
      const newKotlinDir = path.join(tempDir, 'android/app/src/main/java/com/myorg/demoapp');
      expect(fs.existsSync(newKotlinDir)).toBe(true);
      const mainActivity = fs.readFileSync(path.join(newKotlinDir, 'MainActivity.kt'), 'utf8');
      expect(mainActivity).toContain('package com.myorg.demoapp');
      expect(mainActivity).toContain('getMainComponentName(): String = "demoapp"');

      // 5. iOS AppDelegate moduleName must match app.json name
      const appDelegate = fs.readFileSync(
        path.join(tempDir, 'ios/EnterpriseReactNativeTemplate/AppDelegate.mm'),
        'utf8',
      );
      expect(appDelegate).toContain('self.moduleName = @"demoapp";');

      // 6. iOS Info.plist & LaunchScreen
      const infoPlist = fs.readFileSync(
        path.join(tempDir, 'ios/EnterpriseReactNativeTemplate/Info.plist'),
        'utf8',
      );
      expect(infoPlist).toContain('<string>Demo Application</string>');

      const launchScreen = fs.readFileSync(
        path.join(tempDir, 'ios/EnterpriseReactNativeTemplate/LaunchScreen.storyboard'),
        'utf8',
      );
      expect(launchScreen).toContain('text="Demo Application"');

      // 7. scripts/run_ios.sh bundle ID
      const runIos = fs.readFileSync(path.join(tempDir, 'scripts/run_ios.sh'), 'utf8');
      expect(runIos).toContain('BUNDLE_ID="com.myorg.demoapp"');
    });
  });
});
