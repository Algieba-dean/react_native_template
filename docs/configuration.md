# Configuration Guide

Environment variables and runtime configurations are managed via strongly-typed `AppConfig` and `.env` profiles.

## Environments

| Environment | Identifier | Default API Base URL | Log Level |
| ----------- | ---------- | -------------------- | --------- |
| Development | `development` | `https://api-dev.example.com` | Debug / Verbose |
| Staging | `staging` | `https://api-staging.example.com` | Info / Warn |
| Production | `production` | `https://api.example.com` | Error Only |

## Environment Files

- `.env.development`: Loaded during local development.
- `.env.staging`: Loaded for staging / QA builds.
- `.env.production`: Loaded for release production builds.

## Accessing Configuration in Code

Always access runtime configuration via `appConfig.ts`:

```typescript
import { defaultAppConfig } from '@/app/appConfig';

console.log(defaultAppConfig.apiBaseUrl);
console.log(defaultAppConfig.environment);
```
