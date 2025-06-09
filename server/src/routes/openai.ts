const expressOpenAI = require('express');
const OpenAI = require('openai').default;

const openaiRouterInstance = expressOpenAI.Router();

// Lazy initialization of OpenAI client
let openaiClient: typeof OpenAI | null = null;

function getOpenAIClient(): typeof OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

// POST /api/openai/chat/completions
openaiRouterInstance.post('/chat/completions', async (req: any, res: any): Promise<any> => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Messages array is required'
      });
    }

    // Validate model
    const allowedModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    const selectedModel = model || 'gpt-4o-mini';
    
    if (!allowedModels.includes(selectedModel)) {
      return res.status(400).json({
        error: 'Invalid model',
        message: `Model must be one of: ${allowedModels.join(', ')}`
      });
    }

    // Validate token limits
    const maxTokensLimit = selectedModel === 'gpt-4o-mini' ? 2000 : 4000;
    const requestedTokens = max_tokens || 1000;
    
    if (requestedTokens > maxTokensLimit) {
      return res.status(400).json({
        error: 'Token limit exceeded',
        message: `Max tokens for ${selectedModel} is ${maxTokensLimit}`
      });
    }

    // Make request to OpenAI
    const completion = await getOpenAIClient().chat.completions.create({
      model: selectedModel,
      messages,
      temperature: temperature || 0.7,
      max_tokens: requestedTokens
    });

    // Return the response
    res.json(completion);

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Handle OpenAI specific errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'OpenAI API error',
        message: error.response.data?.error?.message || 'Unknown OpenAI error'
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process OpenAI request'
    });
  }
});

// Note: Content generation is handled by /api/content-generation/generate
// This route focuses on general OpenAI chat completions proxy

module.exports = { openaiRouter: openaiRouterInstance };
