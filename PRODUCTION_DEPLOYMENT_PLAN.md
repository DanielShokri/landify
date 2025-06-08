# Landify Production Deployment Plan

## 🎯 Overview
This document outlines the complete production deployment strategy for Landify, an AI-powered landing page generator built with React, TypeScript, and Vite.

## 📋 Pre-Deployment Checklist

### 1. Code Quality & Security
- [ ] All TypeScript strict mode enabled
- [ ] ESLint and Prettier configured
- [ ] Security audit completed (`npm audit`)
- [ ] Environment variables properly configured
- [ ] API keys secured and rotated
- [ ] CORS policies configured
- [ ] Rate limiting implemented

### 2. Performance Optimization
- [ ] Bundle size analysis completed
- [ ] Code splitting implemented
- [ ] Image optimization configured
- [ ] Lazy loading implemented
- [ ] Service worker configured (if needed)
- [ ] CDN strategy defined

### 3. Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests completed
- [ ] E2E tests passing
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit completed

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
**Best for**: Zero-config deployment, excellent performance, built-in CI/CD

#### Setup Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "env": {
       "VITE_OPENAI_API_KEY": "@openai_api_key",
       "VITE_GOOGLE_MAPS_API_KEY": "@google_maps_api_key"
     },
     "functions": {
       "app/api/**/*.ts": {
         "runtime": "nodejs18.x"
       }
     },
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           }
         ]
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### GitHub Actions CI/CD:
```yaml
name: Deploy to Vercel
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Install Vercel CLI
        run: npm install --global vercel@canary
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Option 2: Netlify
**Best for**: Static sites, excellent developer experience, built-in forms

#### Setup Steps:
1. **Configure netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [[headers]]
     for = "/api/*"
     [headers.values]
       Access-Control-Allow-Origin = "*"
   ```

2. **Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### Option 3: AWS S3 + CloudFront
**Best for**: Enterprise deployments, custom infrastructure needs

#### Setup Steps:
1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## 🔧 Environment Configuration

### Environment Variables
Create environment-specific `.env` files:

#### `.env.production`
```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.landify.com
VITE_OPENAI_API_KEY=your_production_openai_key
VITE_GOOGLE_MAPS_API_KEY=your_production_maps_key
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ANALYTICS_ID=your_analytics_id
```

#### `.env.staging`
```env
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://staging-api.landify.com
VITE_OPENAI_API_KEY=your_staging_openai_key
VITE_GOOGLE_MAPS_API_KEY=your_staging_maps_key
VITE_SENTRY_DSN=your_staging_sentry_dsn
```

### Build Configuration Updates

#### Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
          maps: ['@googlemaps/js-api-loader'],
          ai: ['openai'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
```

#### Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-analyzer"
  }
}
```

## 🔒 Security Configuration

### 1. Content Security Policy
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.openai.com https://maps.googleapis.com;
">
```

### 2. API Security
```typescript
// src/lib/apiSecurity.ts
export const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

export const validateApiKey = (key: string): boolean => {
  return key && key.length > 20 && key.startsWith('sk-');
};
```

## 📊 Monitoring & Analytics

### 1. Error Tracking with Sentry
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.VITE_APP_ENV,
});
```

### 2. Performance Monitoring
```typescript
// src/lib/analytics.ts
export const trackPageView = (page: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', import.meta.env.VITE_ANALYTICS_ID, {
      page_title: page,
      page_location: window.location.href,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

### 3. Health Check Endpoint
```typescript
// src/api/health.ts
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: Record<string, boolean>;
}> => {
  const services = {
    openai: await checkOpenAIHealth(),
    googleMaps: await checkGoogleMapsHealth(),
  };

  return {
    status: Object.values(services).every(Boolean) ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services,
  };
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (Complete)
```yaml
name: Landify CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:production
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, build]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Install Vercel CLI
        run: npm install --global vercel@canary
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🎯 Performance Optimization

### 1. Bundle Analysis
```bash
npm run analyze
```

### 2. Code Splitting Strategy
```typescript
// src/pages/index.ts
import { lazy } from 'react';

export const BusinessOnboarding = lazy(() => import('./BusinessOnboarding'));
export const GeneratedLandingPage = lazy(() => import('./GeneratedLandingPage'));
export const LandingPageList = lazy(() => import('./LandingPageList'));
```

### 3. Service Worker (Optional)
```typescript
// public/sw.js
const CACHE_NAME = 'landify-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🔍 Post-Deployment Checklist

### 1. Functional Testing
- [ ] Landing page generation works
- [ ] Google Maps integration functional
- [ ] OpenAI API integration working
- [ ] Form submissions working
- [ ] Navigation working correctly
- [ ] Mobile responsiveness verified

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals passing
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] API response times acceptable

### 3. Security Testing
- [ ] HTTPS enforced
- [ ] API keys not exposed
- [ ] CORS configured correctly
- [ ] CSP headers working
- [ ] No console errors

### 4. Monitoring Setup
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Analytics tracking working
- [ ] Health checks responding

## 🚨 Rollback Strategy

### Immediate Rollback
```bash
# Vercel
vercel rollback [deployment-url]

# Netlify
netlify api rollbackSiteDeploy --site-id=SITE_ID --deploy-id=DEPLOY_ID
```

### Database Rollback (if applicable)
```bash
# Backup before deployment
# Restore from backup if needed
```

## 📞 Support & Maintenance

### 1. Monitoring Alerts
- Set up alerts for:
  - Error rate > 1%
  - Response time > 5 seconds
  - Uptime < 99.9%
  - API quota exceeded

### 2. Regular Maintenance
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly performance reviews
- [ ] Annual architecture reviews

### 3. Emergency Contacts
- DevOps Team: devops@landify.com
- Security Team: security@landify.com
- On-call Engineer: +1-XXX-XXX-XXXX

## 📈 Scaling Considerations

### 1. CDN Configuration
- Configure CloudFront/Cloudflare for global distribution
- Set appropriate cache headers
- Optimize for mobile networks

### 2. API Rate Limiting
- Implement rate limiting for OpenAI API calls
- Add request queuing for high traffic
- Consider API caching strategies

### 3. Database Scaling (Future)
- Plan for user data storage
- Consider read replicas
- Implement connection pooling

---

## 🎉 Deployment Commands Summary

### Quick Deploy to Vercel
```bash
npm run build:production
vercel --prod
```

### Quick Deploy to Netlify
```bash
npm run build:production
netlify deploy --prod --dir=dist
```

### Local Production Testing
```bash
npm run build:production
npm run preview
```

This deployment plan ensures a robust, scalable, and maintainable production environment for the Landify application. 