const express = require('express');
const OpenAI = require('openai').default;

const router = express.Router();

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

// POST /api/openai/chat/completions
router.post('/chat/completions', async (req: any, res: any): Promise<any> => {
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

// POST /api/openai/generate-content (for our fast generation service)
router.post('/generate-content', async (req: any, res: any): Promise<any> => {
  try {
    const { businessData, analysisType } = req.body;

    if (!businessData || !businessData.name) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Business data with name is required'
      });
    }

    let prompt = '';
    let maxTokens = 800;

    switch (analysisType) {
    case 'business_analysis':
      prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Analyze the target market and competitive edge. Return JSON:
{
  "targetMarket": "primary customer type",
  "competitiveEdge": "main advantage",
  "emotionalTriggers": "key emotional appeal"
}`;
      maxTokens = 300;
      break;

    case 'content_generation':
      prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Create compelling content. Return JSON:
{
  "headline": "catchy main headline",
  "subheadline": "supporting description",
  "valuePropositions": ["benefit 1", "benefit 2", "benefit 3"],
  "services": [{"name": "service name", "description": "brief description", "features": ["feature 1", "feature 2"]}],
  "callToAction": {"primary": {"text": "action text", "action": "contact"}, "secondary": {"text": "secondary text", "action": "info"}},
  "aboutSection": "brief about paragraph",
  "trustSignals": ["signal 1", "signal 2", "signal 3"]
}`;
      maxTokens = 800;
      break;

    case 'html_generation':
      prompt = `Create a professional landing page HTML for ${businessData.name}.

Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Headline: ${req.body.headline || businessData.name}

Requirements:
- Use TailwindCSS CDN
- Include hero, services, about, contact sections
- Mobile responsive
- Professional design
- Include contact info: ${businessData.phone || 'N/A'}, ${businessData.address || 'N/A'}

Return only the complete HTML document.`;
      maxTokens = 1500;
      break;

    default:
      return res.status(400).json({
        error: 'Invalid analysis type',
        message: 'analysisType must be: business_analysis, content_generation, or html_generation'
      });
    }

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: analysisType === 'html_generation' 
            ? 'You are a web designer. Return only HTML in English.'
            : 'You are a business analyst. Return only JSON in English.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: analysisType === 'html_generation' ? 0.9 : 0.7,
      max_tokens: maxTokens
    });

    res.json(completion);

  } catch (error: any) {
    console.error('OpenAI content generation error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'OpenAI API error',
        message: error.response.data?.error?.message || 'Unknown OpenAI error'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate content'
    });
  }
});

module.exports = { openaiRouter: router };
