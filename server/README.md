# Landify API Server

A secure proxy server for handling OpenAI and Google Maps API requests from the Landify frontend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
NETLIFY_URL=https://your-app.netlify.app

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Development
```bash
npm run dev
```

Server will run on `http://localhost:3001`

### 4. Production Build
```bash
npm run build
npm start
```

## 📡 API Endpoints

### OpenAI Proxy
- `POST /api/openai/chat/completions` - Direct OpenAI API proxy
- `POST /api/openai/generate-content` - Optimized content generation

### Google Maps Proxy
- `GET /api/google-maps/places/autocomplete?input=query` - Place autocomplete
- `GET /api/google-maps/places/search?query=search` - Places search
- `GET /api/google-maps/places/details/:placeId` - Place details

### Health Check
- `GET /health` - Server health status

## 🚀 Deployment Options

### Option 1: Railway (Recommended)
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy from the `server` folder
4. Set environment variables in Railway dashboard
5. Get the deployment URL

### Option 2: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create landify-api`
3. Set buildpacks: `heroku buildpacks:set heroku/nodejs`
4. Set environment variables: `heroku config:set OPENAI_API_KEY=your-key`
5. Deploy: `git subtree push --prefix server heroku main`

### Option 3: DigitalOcean App Platform
1. Create DigitalOcean account
2. Create new App from GitHub
3. Select `server` folder as source
4. Configure environment variables
5. Deploy

## 🔒 Security Features

- **CORS Protection**: Only allows requests from your frontend domains
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Validates all request parameters
- **API Key Security**: Never exposes API keys to frontend
- **Helmet.js**: Security headers protection

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Local development URL | Yes |
| `NETLIFY_URL` | Production frontend URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No (default: 100) |

## 📝 Frontend Integration

Update your frontend to use the server endpoints instead of direct API calls:

```typescript
// Old (direct API call)
const response = await openai.chat.completions.create({...});

// New (via server proxy)
const response = await fetch('https://your-server.railway.app/api/openai/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, model, temperature, max_tokens })
});
```

## 🛠 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 📊 Monitoring

The server includes:
- Request/response logging
- Error tracking
- Health check endpoint
- Rate limiting metrics

Access health check: `GET /health`

## 🔄 Deployment Workflow

1. **Code Changes**: Make changes to server code
2. **Test Locally**: Run `npm run dev` and test endpoints
3. **Build**: Run `npm run build` to check for errors
4. **Deploy**: Push to your deployment platform
5. **Update Frontend**: Update frontend API URLs if needed
6. **Test Production**: Verify endpoints work with your Netlify frontend 