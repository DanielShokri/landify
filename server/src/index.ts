// Load environment variables first
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

// Import dependencies
const cors = require('cors');
const expressMain = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { googleMapsRouter } = require('./routes/google-maps');
const { openaiRouter } = require('./routes/openai');
const { contentRouter } = require('./routes/content-generation');

const app = expressMain();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.NETLIFY_URL || 'https://landifyai.netlify.app',
      'https://landifyai.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(expressMain.json({ limit: '10mb' }));
app.use(expressMain.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/openai', openaiRouter);
app.use('/api/google-maps', googleMapsRouter);
app.use('/api/content-generation', contentRouter);

// 404 handler
app.use('*', (req: any, res: any) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error: Error, req: any, res: any, _next: any) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 