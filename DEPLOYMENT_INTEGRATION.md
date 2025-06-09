# 🚀 Production Deployment Integration Guide

## Overview
This guide documents the integration between your frontend ([landifyai.netlify.app](https://landifyai.netlify.app/)) and backend ([landify-be-production.up.railway.app](https://landify-be-production.up.railway.app/)) in production.

## 🔗 Production URLs
- **Frontend**: https://landifyai.netlify.app/
- **Backend**: https://landify-be-production.up.railway.app/

## 🔧 Frontend Configuration

### Environment Variables
The frontend automatically detects the environment and uses the appropriate API URL:

```typescript
// Development
const API_URL = 'http://localhost:8080'

// Production  
const API_URL = 'https://landify-be-production.up.railway.app'
```

### Files Updated
1. **`.env.example`** - Added production API URL configuration
2. **`.env.production`** - Production environment file
3. **`src/api/proxyService.ts`** - Updated to use production URL
4. **`src/api/contentService.ts`** - Updated to use production URL  
5. **`src/vite-env.d.ts`** - Added TypeScript types
6. **`netlify.toml`** - Netlify deployment configuration

## 🌐 API Integration

### Automatic Environment Detection
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_PROD_API_URL || 'https://landify-be-production.up.railway.app')
  : (import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080');
```

### API Services Updated
- ✅ **ProxyService** - OpenAI and Google Maps API calls
- ✅ **ContentService** - Landing page generation
- ✅ **Health checks** - Server status monitoring

## 🔒 CORS Configuration

### Backend CORS Settings
The Railway server allows requests from:
```javascript
const allowedOrigins = [
  'https://landifyai.netlify.app',  // Your production frontend
  'http://localhost:5173',          // Local development
  'http://localhost:3000',          // Alternative local port
];
```

## 📡 API Endpoints Available

### OpenAI Proxy
- `POST /api/openai/chat/completions`
- `POST /api/openai/generate-content`

### Google Maps Proxy  
- `GET /api/google-maps/places/autocomplete?input=query`
- `GET /api/google-maps/places/search?query=search`
- `GET /api/google-maps/places/details/:placeId`

### Content Generation
- `POST /api/content-generation/generate`
- `GET /api/content-generation/capabilities`

### Health Check
- `GET /health`

## 🛠 Development vs Production

### Development Mode
```bash
npm run dev
# Uses: http://localhost:8080
```

### Production Build  
```bash
npm run build
# Uses: https://landify-be-production.up.railway.app
```

## 🚀 Deployment Workflow

### Frontend (Netlify)
1. **Automatic deployment** from GitHub commits
2. **Environment variables** set in `netlify.toml`
3. **Build command**: `npm run build`
4. **Output directory**: `dist`

### Backend (Railway)
1. **Automatic deployment** from GitHub commits  
2. **Environment variables** set in Railway dashboard
3. **Health monitoring** via `/health` endpoint
4. **CORS enabled** for your frontend domain

## 🔍 Testing the Integration

### Health Check
Test your backend is running:
```bash
curl https://landify-be-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z", 
  "environment": "production"
}
```

### API Test
Test content generation:
```bash
curl -X POST https://landify-be-production.up.railway.app/api/content-generation/generate \
  -H "Content-Type: application/json" \
  -d '{"businessData": {"name": "Test Business", "type": "restaurant"}}'
```

## 🏗 Next Steps

1. **Set API Keys** in Railway dashboard:
   - `OPENAI_API_KEY` 
   - `GOOGLE_MAPS_API_KEY`
   - `NETLIFY_URL=https://landifyai.netlify.app`

2. **Monitor deployment**:
   - Check Railway deployment logs
   - Test frontend at https://landifyai.netlify.app/
   - Verify API calls work end-to-end

3. **Optional enhancements**:
   - Set up error monitoring (Sentry)
   - Add analytics tracking
   - Configure custom domain

## 🐛 Troubleshooting

### CORS Errors
- Verify frontend URL is in server's allowed origins
- Check Railway environment variables

### API Errors  
- Check Railway deployment logs
- Verify API keys are set correctly
- Test health endpoint directly

### Build Errors
- Check Netlify build logs
- Verify environment variables in `netlify.toml`
- Test local build with `npm run build`

## 📊 Monitoring

### Frontend (Netlify)
- Build status in Netlify dashboard
- Site analytics and performance

### Backend (Railway)  
- Server metrics in Railway dashboard
- Health check endpoint monitoring
- Error logs and debugging

---

🎉 **Your frontend and backend are now fully integrated in production!**

Visit https://landifyai.netlify.app/ to see your live application. 