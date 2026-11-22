#!/usr/bin/env node

/**
 * Enterprise React Native Template Project Initializer
 * Mirrors Flutter template's tool/init_project.dart
 *
 * Usage:
 *   node tool/init_project.js
 *   node tool/init_project.js --help
 *   node tool/init_project.js --name="my_new_app" --bundle-id="com.company.mynewapp" --display-name="My New App" --reset-git
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function showHelp() {
  log(`
${colors.bright}${colors.blue}Enterprise React Native Template Initializer${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node tool/init_project.js [OPTIONS]

${colors.bright}OPTIONS:${colors.reset}
  -n, --name <name>            Project package name (e.g. my-awesome-app)
  -d, --display-name <name>    User-visible App Display Name (e.g. "My Awesome App")
  -b, --bundle-id <bundle_id>  Bundle ID / Package Name (e.g. com.example.myawesomeapp)
  --reset-git                  Re-initialize Git repository to a clean initial commit
  -y, --yes                    Accept defaults for all unprovided options non-interactively
  -h, --help                   Display this help message and exit

${colors.bright}EXAMPLES:${colors.reset}
  # Interactive mode
  node tool/init_project.js

  # Non-interactive CLI configuration
  node tool/init_project.js --name="shop-app" --display-name="Super Shop" --bundle-id="com.shop.app" --reset-git
`, colors.reset);
}

function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    const formattedPrompt = defaultValue
      ? `${colors.cyan}${question}${colors.reset} [${defaultValue}]: `
      : `${colors.cyan}${question}${colors.reset}: `;

    rl.question(formattedPrompt, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      result.help = true;
    } else if (arg === '-y' || arg === '--yes') {
      result.yes = true;
    } else if (arg === '--reset-git') {
      result.resetGit = true;
    } else if (arg.startsWith('--reset-git=')) {
      const val = arg.substring('--reset-git='.length).toLowerCase();
      result.resetGit = val === 'true' || val === 'yes' || val === '1';
    } else if (arg.startsWith('--name=')) {
      result.name = arg.substring('--name='.length).replace(/['"]/g, '');
    } else if (arg === '-n' || arg === '--name') {
      result.name = args[++i]?.replace(/['"]/g, '');
    } else if (arg.startsWith('--bundle-id=')) {
      result.bundleId = arg.substring('--bundle-id='.length).replace(/['"]/g, '');
    } else if (arg === '-b' || arg === '--bundle-id') {
      result.bundleId = args[++i]?.replace(/['"]/g, '');
    } else if (arg.startsWith('--display-name=')) {
      result.displayName = arg.substring('--display-name='.length).replace(/['"]/g, '');
    } else if (arg === '-d' || arg === '--display-name') {
      result.displayName = args[++i]?.replace(/['"]/g, '');
    }
  }

  return result;
}

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}

async function main() {
  const cliArgs = parseArgs();

  if (cliArgs.help) {
    showHelp();
    process.exit(0);
  }

  log('\n======================================================', colors.bright + colors.blue);
  log('   Enterprise React Native Template Initializer', colors.bright + colors.blue);
  log('======================================================\n', colors.bright + colors.blue);

  const isInteractive = !cliArgs.yes && Boolean(process.stdin.isTTY);

  const projectName =
    cliArgs.name ||
    (isInteractive
      ? await prompt('Project package name (e.g. my-awesome-app)', 'my-awesome-app')
      : 'my-awesome-app');

  const displayName =
    cliArgs.displayName ||
    (isInteractive
      ? await prompt('App Display Name (e.g. My Awesome App)', 'My Awesome App')
      : 'My Awesome App');

  const bundleId =
    cliArgs.bundleId ||
    (isInteractive
      ? await prompt(
          'Bundle ID / Package Name (e.g. com.example.myawesomeapp)',
          'com.example.myawesomeapp',
        )
      : 'com.example.myawesomeapp');

  let resetGit = cliArgs.resetGit;
  if (resetGit === undefined) {
    if (isInteractive) {
      const resetGitAnswer = await prompt('Reset Git history? (y/N)', 'N');
      resetGit = resetGitAnswer.toLowerCase() === 'y' || resetGitAnswer.toLowerCase() === 'yes';
    } else {
      resetGit = false;
    }
  }

  log('\nConfiguring project with:', colors.yellow);
  log(`  Project Name: ${projectName}`);
  log(`  Display Name: ${displayName}`);
  log(`  Bundle ID:    ${bundleId}`);
  log(`  Reset Git:    ${resetGit ? 'Yes' : 'No'}\n`);

  // 1. Update package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = projectName;
    packageJson.description = `${displayName} - Built with Enterprise React Native Template`;
    packageJson.version = '0.1.0';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    log('✓ Updated package.json', colors.green);
  }

  // 2. Update app.json
  const appJsonPath = path.join(rootDir, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '');
    const appJson = {
      name: sanitizedName,
      displayName: displayName,
    };
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    log('✓ Updated app.json', colors.green);
  }

  // 3. Update Environment files
  const envFiles = ['.env.development', '.env.staging', '.env.production', '.env.example'];
  for (const envFile of envFiles) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(/APP_TITLE=.*/g, `APP_TITLE="${displayName}"`);
      fs.writeFileSync(envPath, content, 'utf8');
    }
  }
  log('✓ Updated environment files (.env.*)', colors.green);

  // 4. Update Maestro Configuration & Flows
  const maestroFiles = [
    '.maestro/config.yaml',
    '.maestro/flows/01_app_launch.yaml',
    '.maestro/flows/02_theme_toggle.yaml',
    '.maestro/flows/03_language_switch.yaml',
    '.maestro/flows/04_system_dialogs_and_files.yaml',
  ];
  for (const maestroFile of maestroFiles) {
    replaceInFile(maestroFile, [['com.enterprise.reactnativetemplate', bundleId]]);
  }
  log('✓ Updated Maestro E2E test suite configurations', colors.green);

  // 5. Update Android Project Configuration
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '');
  const androidAppGradle = 'android/app/build.gradle';
  replaceInFile(androidAppGradle, [
    ['namespace "com.enterprisereactnativetemplate"', `namespace "${bundleId}"`],
    ['applicationId "com.enterprisereactnativetemplate"', `applicationId "${bundleId}"`],
  ]);

  const androidStrings = 'android/app/src/main/res/values/strings.xml';
  replaceInFile(androidStrings, [
    ['<string name="app_name">EnterpriseReactNativeTemplate</string>', `<string name="app_name">${displayName}</string>`],
  ]);

  const androidSettings = 'android/settings.gradle';
  replaceInFile(androidSettings, [
    ["rootProject.name = 'EnterpriseReactNativeTemplate'", `rootProject.name = '${sanitizedName}'`],
  ]);

  // Relocate Android Kotlin source files to match package name
  const oldJavaDir = path.join(rootDir, 'android/app/src/main/java/com/enterprisereactnativetemplate');
  if (fs.existsSync(oldJavaDir)) {
    const newJavaDir = path.join(rootDir, 'android/app/src/main/java', ...bundleId.split('.'));
    if (oldJavaDir !== newJavaDir) {
      fs.mkdirSync(newJavaDir, { recursive: true });
      for (const file of fs.readdirSync(oldJavaDir)) {
        const srcFile = path.join(oldJavaDir, file);
        const dstFile = path.join(newJavaDir, file);
        let content = fs.readFileSync(srcFile, 'utf8');
        content = content.replace(/package com\.enterprisereactnativetemplate/g, `package ${bundleId}`);
        content = content.replace(/getMainComponentName\(\): String = "[^"]*"/g, `getMainComponentName(): String = "${sanitizedName}"`);
        fs.writeFileSync(dstFile, content, 'utf8');
        fs.unlinkSync(srcFile);
      }
      // Clean up empty directories
      try {
        fs.rmdirSync(oldJavaDir);
        fs.rmdirSync(path.join(rootDir, 'android/app/src/main/java/com'));
      } catch (e) {
        // Ignored if parent still has files
      }
    }
  }
  log('✓ Updated Android native project (package, namespace, strings, settings)', colors.green);

  // 6. Update iOS Project Configuration
  const pbxprojPath = 'ios/EnterpriseReactNativeTemplate.xcodeproj/project.pbxproj';
  replaceInFile(pbxprojPath, [
    ['PRODUCT_BUNDLE_IDENTIFIER = "org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)";', `PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";`],
    ['PRODUCT_BUNDLE_IDENTIFIER = com.enterprise.reactnativetemplate;', `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`],
  ]);

  const iosInfoPlistPath = 'ios/EnterpriseReactNativeTemplate/Info.plist';
  if (fs.existsSync(path.join(rootDir, iosInfoPlistPath))) {
    replaceInFile(iosInfoPlistPath, [
      ['<key>CFBundleDisplayName</key>\n\t<string>EnterpriseReactNativeTemplate</string>', `<key>CFBundleDisplayName</key>\n\t<string>${displayName}</string>`],
    ]);
  }

  const runIosScript = 'scripts/run_ios.sh';
  replaceInFile(runIosScript, [
    ['BUNDLE_ID="com.enterprise.reactnativetemplate"', `BUNDLE_ID="${bundleId}"`],
  ]);
  log('✓ Updated iOS native project (bundle ID, display name, runner scripts)', colors.green);

  // 7. Git Reset (if requested)
  if (resetGit) {
    const gitDir = path.join(rootDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
      try {
        execSync('git init -b main', { cwd: rootDir, stdio: 'ignore' });
        log('✓ Reinitialized Git repository on branch main', colors.green);
      } catch (e) {
        execSync('git init', { cwd: rootDir, stdio: 'ignore' });
        log('✓ Reinitialized Git repository', colors.green);
      }
    }
  }

  log('\n✨ Project initialization complete!', colors.bright + colors.green);
  log('\nNext steps:');
  log('  1. Run `make setup` (or `npm install`) to install dependencies');
  log('  2. Run `make start` to launch the Metro bundler');
  log('  3. Run `make run-ios` or `make run-android` to launch on your device/simulator\n');
}

main().catch(err => {
  log(`Error initializing project: ${err.message}`, colors.red);
  process.exit(1);
});

