# 🚀 Landify Deployment Guide - Vercel

## Quick Start

### 1. Prerequisites
- [Vercel account](https://vercel.com)
- [GitHub repository](https://github.com) with your Landify code
- OpenAI API key
- Google Maps API key

### 2. One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/landify)

### 3. Manual Setup

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy from your project directory
```bash
cd /path/to/landify
vercel
```

Follow the prompts:
- Link to existing project? `N`
- What's your project's name? `landify`
- In which directory is your code located? `./`
- Want to override the settings? `N`

#### Step 4: Set Environment Variables
In your Vercel dashboard or via CLI:

```bash
# Production environment
vercel env add VITE_OPENAI_API_KEY production
vercel env add VITE_GOOGLE_MAPS_API_KEY production

# Preview/Development environment  
vercel env add VITE_OPENAI_API_KEY preview
vercel env add VITE_GOOGLE_MAPS_API_KEY preview
```

## GitHub Integration (Recommended)

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

### 2. Configure Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Production, Preview |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | Production, Preview |

### 3. Set up GitHub Actions (Optional)
The included workflow file `.github/workflows/vercel-deploy.yml` will automatically:
- Run type checking and linting
- Deploy previews for pull requests
- Deploy to production on main branch pushes

**Required GitHub Secrets:**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id
```

Get these from your Vercel dashboard:
- `VERCEL_TOKEN`: Account Settings → Tokens
- `VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`: Project Settings → General

## Custom Domain (Optional)

### 1. Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 2. Update CORS Settings
Update `vercel.json` if needed for your domain.

## Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (if applicable)
- [ ] API keys are valid and have proper quotas
- [ ] GitHub integration working
- [ ] SSL certificate active (automatic with Vercel)

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check linting: `npm run lint`
- Verify environment variables are set

### API Issues
- Ensure OpenAI API key has sufficient credits
- Verify Google Maps API key has required permissions:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### Deploy Issues  
- Check Vercel function logs in dashboard
- Verify `vercel.json` configuration
- Ensure all environment variables are set

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)

## URLs After Deployment

- **Production**: `https://landify.vercel.app` (or your custom domain)
- **Preview**: Unique URL for each PR/branch
- **Analytics**: Available in Vercel dashboard 