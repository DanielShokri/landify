# Landify

AI-powered landing page generator that combines Google Maps business data with OpenAI's content generation capabilities to create tailored marketing websites.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Google Maps API key

### Installation
```bash
git clone https://github.com/DanielShokri/landify.git
cd landify
npm install
```

### Environment Setup
Create `.env` file:
```bash
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## 🏗️ Architecture & Design Decisions

### **Tech Stack**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: React Query (server state) + Context (UI state)
- **Deployment**: Vercel (automatic deployments)

### **Key Libraries**
- `lucide-react` - Icon system
- `rxjs` - Reactive programming for AI agent orchestration
- `openai` - OpenAI API integration
- `@googlemaps/js-api-loader` - Google Maps integration

### **Design Patterns**
- **Multi-Agent System**: Modular AI agents for business analysis, content strategy, and synthesis
- **Observable Streams**: Real-time progress updates during content generation
- **Component Composition**: Reusable UI components with TypeScript interfaces
- **Portal Rendering**: Z-index independent dropdowns and modals

## 🤖 AI Integration

### **Multi-Agent Architecture**
1. **Business Analysis Agent** - Analyzes market positioning and customer psychology
2. **Content Strategy Agent** - Creates compelling messaging and value propositions  
3. **Synthesis Agent** - Combines insights into final HTML/content structure

### **AI Workflow**
```
Google Maps Data → Business Analysis → Content Strategy → HTML Generation
```

### **Language Enforcement**
All AI responses are constrained to English-only output through system-level prompts.

### **Models Used**
- **GPT-4o-mini**: Primary model for content generation (cost-effective, fast)
- **Temperature**: 0.7-0.95 (balanced creativity vs consistency)
- **Max Tokens**: 2000 (sufficient for detailed responses)

## 📝 Assumptions & Limitations

### **Assumptions**
- Users have valid Google Places business listings
- Businesses have sufficient online presence for analysis
- English-language target audience
- Modern browser support (ES2020+)

### **Limitations**
- **API Dependencies**: Requires active OpenAI and Google Maps API keys
- **Rate Limits**: Subject to OpenAI API usage limits
- **Client-Side APIs**: API keys exposed in browser (development only)
- **Business Data**: Limited to Google Places API data availability
- **Language**: English-only content generation
- **Browser Compatibility**: Modern browsers only (no IE support)

### **Security Considerations**
- API keys should be server-side in production
- Consider rate limiting for production deployments
- Implement proper CORS policies

## 📊 Project Structure

```
src/
├── api/agents/        # Multi-agent AI system
├── components/        # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── types/            # TypeScript definitions
└── utils/            # Helper functions
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Auto-deployment on push to main branch

### **Environment Variables**
- `VITE_OPENAI_API_KEY` - OpenAI API key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

---

**Built with** ⚡ Vite • 🎨 TailwindCSS • 🤖 OpenAI • 🗺️ Google Maps 